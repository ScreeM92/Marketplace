pragma solidity 0.4.21;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }
}

/**
 * @title TokenERC20Interface
 * @dev The TokenERC20Interface Interface
 */
contract TokenERC20Interface {
    /* This is a slight change to the ERC20 base standard.
    function totalSupply() constant returns (uint256 supply);
    is replaced with:
    uint256 public totalSupply;
    This automatically creates a getter function for the totalSupply.
    This is moved to the base contract since public getter functions are not
    currently recognised as an implementation of the matching abstract
    function by the compiler.
    */
    /// total amount of tokens
    uint256 public totalSupply;

    /// @param _owner The address from which the balance will be retrieved
    /// @return The balance
    function balanceOf(address _owner) public view returns (uint256 balance);

    /// @notice send `_value` token to `_to` from `msg.sender`
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transfer(address _to, uint256 _value) public returns (bool success);

    /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
    /// @param _from The address of the sender
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);

    /// @notice `msg.sender` approves `_spender` to spend `_value` tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @param _value The amount of tokens to be approved for transfer
    /// @return Whether the approval was successful or not
    function approve(address _spender, uint256 _value) public returns (bool success);

    /// @param _owner The address of the account owning tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @return Amount of remaining tokens allowed to spent
    function allowance(address _owner, address _spender) public view returns (uint256 remaining);

    // solhint-disable-next-line no-simple-event-func-name
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

/**
 * @title TokenERC20
 * @dev The TokenERC20 Abstract class
 */
contract TokenERC20 is TokenERC20Interface {

    uint256 constant private MAX_UINT256 = 2**256 - 1;
    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed;
    /*
    NOTE:
    The following variables are OPTIONAL vanities. One does not have to include them.
    They allow one to customise the token contract & in no way influences the core functionality.
    Some wallets/interfaces might not even bother to look at this information.
    */
    string public name;                   //name
    uint8 public decimals;                //How many decimals to show.
    string public symbol;                 //An identifier

    function TokenERC20(
        uint256 _initialAmount,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol
    ) public {
        balances[msg.sender] = _initialAmount;               // Give the creator all initial tokens
        totalSupply = _initialAmount;                        // Update total supply
        name = _tokenName;                                   // Set the name for display purposes
        decimals = _decimalUnits;                            // Amount of decimals for display purposes
        symbol = _tokenSymbol;                               // Set the symbol for display purposes
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balances[msg.sender] >= _value);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value); //solhint-disable-line indent, no-unused-vars
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        uint256 allowance = allowed[_from][msg.sender];
        require(balances[_from] >= _value && allowance >= _value);
        balances[_to] += _value;
        balances[_from] -= _value;
        if (allowance < MAX_UINT256) {
            allowed[_from][msg.sender] -= _value;
        }
        emit Transfer(_from, _to, _value); //solhint-disable-line indent, no-unused-vars
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value); //solhint-disable-line indent, no-unused-vars
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }
}

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw an error
 */
library SafeMath {
  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

/**
 * @title MoviesLib
 * @dev Movie library for add, edit, buy and like operations that throw an error
 */
library MoviesLib {
    using SafeMath for uint;
    
    event AddMovie(string title, uint256 price, uint256 quantity);
    event EditMovie(string title, uint256 price, uint256 quantity);
    event LikeMovie(address indexed user, string title, uint256 likes);
    event BuyMovie(
        address indexed buyer,
        string title,
        uint256 price,
        uint256 oldQuantity,
        uint256 newQuantity
    );
    event GroupBuyMovie(
        address[] indexed users,
        string title,
        uint256 price,
        uint256 oldQuantity,
        uint256 newQuantity
    );
    
    struct Movie {
        bytes32 id;
        string title;
        string category;
        string description;
        string imgUrl;
        uint256 price;
        uint256 quantity;
        uint256 likes;
        bool available;
        mapping (address => bool) userLikes;
    }
    
    struct MovieEdit {
        string title;
        string category;
        string description;
        string imgUrl;
        uint256 price;
        uint256 quantity;
    }
    
    struct MovieGroupBuy {
        bytes32 groupId;
        bytes32 movieId;
        uint256 totalPrice;
        uint256 quantity;
        uint256 remainingPrice;
        bool available;
        bool finished;
        mapping(address => uint256) userTokens;
        address[] users;
    }
    
    /**
    * @dev This function is made for validating the input data and return movie otherwise throw an error
    * 
    * @param _id The id of the movie
    * @param _title The title of the movie
    * @param _category The category of the movie
    * @param _description The description of the movie
    * @param _imgUrl The image url of the movie
    * @param _price The price of the movie
    * @param _quantity The quantity of the movie
    * 
    * @return Movie The new movie that will be create
    */
    function add(
        bytes32 _id,
        string _title,
        string _category,
        string _description,
        string _imgUrl,
        uint256 _price,
        uint256 _quantity
    ) 
        internal
        returns(Movie)
    {
        checkMovieData(_title, _category, _description, _imgUrl, _price, _quantity);
        emit AddMovie(_title, _price, _quantity);
        
        return Movie({
            id: _id,
            title: _title,
            category: _category,
            description: _description,
            imgUrl: _imgUrl,
            price: _price,
            quantity: _quantity,
            likes: 0,
            available: true
        });
    }
    
    /**
    * @dev This function is made for validating the input data and change the movie data otherwise throw an error
    * 
    * @param self The movie that will be edited
    * @param movieEdit The new data for editting movie
    */
    function edit(Movie storage self, MovieEdit movieEdit) internal {
        checkMovieData(
            movieEdit.title,
            movieEdit.category,
            movieEdit.description,
            movieEdit.imgUrl,
            movieEdit.price,
            movieEdit.quantity
        );
        
        if(keccak256(self.title) != keccak256(movieEdit.title)) {
            self.title = movieEdit.title;
        }
        if(keccak256(self.category) != keccak256(movieEdit.category)) {
            self.category = movieEdit.category;
        }
        if(keccak256(self.description) != keccak256(movieEdit.description)) {
            self.description = movieEdit.description;
        }
        if(keccak256(self.imgUrl) != keccak256(movieEdit.imgUrl)) {
            self.imgUrl = movieEdit.imgUrl;
        }
        if(self.price != movieEdit.price) {
            self.price = movieEdit.price;
        }
        if(self.quantity != movieEdit.quantity) {
            self.quantity = movieEdit.quantity;
        }

        emit EditMovie(movieEdit.title, movieEdit.price, movieEdit.quantity);
    }
    
    /**
    * @dev This function is made for buying a movie
    * 
    * @param self The movie that will be bought
    * @param _quantity The buying quantity of the movie
    */
    function buy(Movie storage self, uint256 _quantity) internal {
        uint256 newQuantity = SafeMath.sub(self.quantity, _quantity);
        
        emit BuyMovie(msg.sender, self.title, self.price, self.quantity, newQuantity);
        self.quantity = newQuantity;
    }
    
    /**
    * @dev This function is made for group buying a movie
    * 
    * @param self The movie that will be bought
    * @param group The Group for buying movie
    */
    function groupBuy(Movie storage self, MovieGroupBuy group) internal {
        require(self.quantity >= group.quantity);
        uint256 newQuantity = SafeMath.sub(self.quantity, group.quantity);
        
        emit GroupBuyMovie(group.users, self.title, group.totalPrice, self.quantity, newQuantity);
        self.quantity = newQuantity;
    }
    
    /**
    * @dev This function is made for liking a movie
    * 
    * @param self The movie that will be liked
    */
    function like(Movie storage self) internal {
        self.userLikes[msg.sender] = true;
        self.likes = SafeMath.add(self.likes, 1);
        
        emit LikeMovie(msg.sender, self.title, self.likes);
    }
    
    /**
    * @dev This function is made for validating movie data otherwise throw an error
    * 
    * @param title The title of the movie
    * @param category The category of the movie
    * @param description The description of the movie
    * @param imgUrl The image url of the movie
    * @param price The price of the movie
    * @param quantity The quantity of the movie
    */
    function checkMovieData(
        string title,
        string category,
        string description,
        string imgUrl,
        uint256 price,
        uint256 quantity
    )
        private
        pure
    {
        require(bytes(title).length != 0);
        require(bytes(category).length != 0);
        require(bytes(description).length != 0);
        require(bytes(imgUrl).length != 0);
        require(price >= 1);
        require(quantity >= 1);
    }
}

/**
 * @title Marketplace
 * @dev The Marketplace contract for add, edit, buy and like operations that throw an error
 */
contract Marketplace is Ownable, TokenERC20 {
    using SafeMath for uint;
    using MoviesLib for MoviesLib.Movie;
    mapping(bytes32 => MoviesLib.Movie) movies;
    mapping(bytes32 => MoviesLib.MovieGroupBuy) public groups;
    mapping(address => bytes32[]) public userGroups;
    bytes32[] private movieIds;
    bytes32[] private groupIds;
    uint256 public tokenPrice = 1000;
    uint256 initialSupply = 12000000;
    uint8 tokenDecimals = 16;
    string tokenName = "LimeChain";
    string tokenSymbol = "LMN";
    
    event Withdraw(address indexed to, uint amountWithdrawn);
    event CreateGroup(address indexed creator, bytes32 movieId, uint256 quantity, uint256 price);
    
    /**
    * @dev This modifier is made for check if the movie is available
    * 
    * @param id The id of the movie
    */
    modifier IsMovieAvailable(bytes32 id) {
        require(movies[id].available);
        _;
    }
    
    /**
    * @dev This modifier is made for check if the group for buying is available
    * 
    * @param id The id of the group
    */
    modifier IsGroupAvailable(bytes32 id) {
        require(groups[id].available);
        _;
    }
    
    /**
    * @dev This modifier is made for check if the group for buying is not finished
    * 
    * @param id The id of the group
    */
    modifier IsGroupNotFinished(bytes32 id) {
        require(!groups[id].finished);
        _;
    }
    
    /**
    * @dev This modifier is made for check if the user doesn't like the movie
    * 
    * @param id The id of the movie
    */
    modifier IsUserNotLikedMovie(bytes32 id) {
        require(!movies[id].userLikes[msg.sender]);
        _;
    }
    
    /**
    * @dev This modifier is made for check if the movie quantity is available
    * 
    * @param movieQuantity The quantity of the movie
    * @param needQuantity The needed quantity of the movie
    */
    modifier IsQuantityAvailable(uint256 movieQuantity, uint256 needQuantity) {
        require(movieQuantity >= needQuantity);
        _;
    }
    
    /**
    * @notice The constructor of the Marketplace contract
    * @dev Initializes contract with initial supply tokens to the creator of the contract
    */
    function Marketplace() TokenERC20(initialSupply, tokenName, tokenDecimals, tokenSymbol) public {}
    
    /**
    * @notice  Buy tokens from contract by sending ether
    */
    function buyTokens() payable public {
        require(msg.value / 1 ether > 0); //at least 1 ether
        require((msg.value % 1 ether) == 0); //accept only round ETH
        
        uint256 tokens = SafeMath.mul((msg.value / 1 ether), tokenPrice) ; // calculates the amount
        
        require (balances[owner] >= tokens);               // Check if the sender has enough
        require (balances[msg.sender] + tokens >= balances[msg.sender]); // Check for overflows
        balances[owner] -= tokens;                         // Subtract from the sender
        balances[msg.sender] += tokens;                           // Add the same to the recipient
        emit Transfer(owner, msg.sender, tokens);
    }
    
    /**
    * @dev This function is made for adding a movie
    * 
    * @param _title The title of the movie
    * @param _category The category of the movie
    * @param _description The description of the movie
    * @param _imgUrl The image url of the movie
    * @param _price The price of the movie
    * @param _quantity The quantity of the movie
    * 
    * @return Movie The new movie that will be create
    */
    function addMovie(
        string _title,
        string _category,
        string _description,
        string _imgUrl,
        uint256 _price,
        uint256 _quantity
    )
        public
        onlyOwner
    {
        bytes32 blockHash = block.blockhash(block.number - 1);
        bytes32 id = keccak256(msg.sender, _title, now, blockHash);
        require(!movies[id].available);
        
        movies[id] = MoviesLib.add(
            id,
            _title,
            _category,
            _description,
            _imgUrl,
            _price,
            _quantity
        );
        movieIds.push(id);
    }
    
    /**
    * @dev This function is made for editting the movie and if the movie doesn't exist trown an error
    *       or didn't call from the owner trown an error
    * 
    * @param _id The id of the movie
    * @param _title The title of the movie
    * @param _category The category of the movie
    * @param _description The description of the movie
    * @param _imgUrl The image url of the movie
    * @param _price The price of the movie
    * @param _quantity The quantity of the movie
    */
    function editMovie(
        bytes32 _id,
        string _title,
        string _category,
        string _description,
        string _imgUrl,
        uint256 _price,
        uint256 _quantity
    )
        public
        onlyOwner
        IsMovieAvailable(_id)
    {
        MoviesLib.MovieEdit memory movieEdit = MoviesLib.MovieEdit({
            title: _title,
            category: _category,
            description: _description,
            imgUrl: _imgUrl,
            price: _price,
            quantity: _quantity
        });
        movies[_id].edit(movieEdit);
    }
    
    /**
    * @dev This function is made for get the movie and if the movie doesn't exist
    *       or isn't call from the owner trown an error
    * 
    * @param _id The id of the movie
    * 
    * @return title The title of the movie
    * @return category The category of the movie
    * @return description The description of the movie
    * @return imgUrl The image url of the movie
    * @return price The price of the movie
    * @return quantity The quantity of the movie
    * @return likes The likes of the movie
    */
    function getMovie(
        bytes32 _id
    )
        view
        public
        IsMovieAvailable(_id)
        returns (
            string title,
            string category,
            string description,
            string imgUrl,
            uint256 price,
            uint256 quantity,
            uint256 likes
        )
    {
        MoviesLib.Movie storage movie = movies[_id];
        uint256 newPrice = dynamicPrice(movie.price, movie.quantity);
        
        return (
            movie.title,
            movie.category,
            movie.description,
            movie.imgUrl,
            newPrice,
            movie.quantity,
            movie.likes
        );
    }
    
    /**
    * @dev This function is made for get the movie price and if the movie doesn't exist 
    *       or the quantity is not available trown an error
    * 
    * @param _id The id of the movie
    * @param _quantity The needed quantity of the movie
    * 
    * @return price The calculated price of the movie according to the quantity
    */
    function getMoviePrice(bytes32 _id, uint256 _quantity)
        view
        public
        IsMovieAvailable(_id)
        IsQuantityAvailable(movies[_id].quantity, _quantity)
        returns(
            uint256 price
        ) 
    {
        return dynamicPrice(movies[_id].price, _quantity);
    }
    
    /**
    * @dev This function is made for buying a movie if the movie doesn't exist 
    *       or the wei sent is less trown an error
    * 
    * @param _id The id of the movie
    * @param _quantity The needed quantity of the movie
    */
    function buyMovie(bytes32 _id, uint256 _quantity) public IsMovieAvailable(_id) {
        MoviesLib.Movie storage movie = movies[_id];
        
        require(_quantity <= movie.quantity);
        uint256 newPrice = dynamicPrice(movie.price, movie.quantity);
        uint256 orderPrice = SafeMath.mul(_quantity, newPrice);
        
        transfer(owner, orderPrice); // makes the transfers
        movie.buy(_quantity);
    }
    
    /**
    * @dev This function is made for create a group for buying a movie if the movie doesn't exist 
    *       trown an error
    * 
    * @param _movieId The id of the movie
    * @param _quantity The needed quantity of the movie
    * 
    * @return The group id that was created
    */
    function createGroupBuyMovie(bytes32 _movieId, uint256 _quantity) 
        public 
        IsMovieAvailable(_movieId) 
        returns(bytes32 buyMovieGroupId) 
    {
        MoviesLib.Movie storage movie = movies[_movieId];
        
        require(_quantity <= movie.quantity);
        uint256 newPrice = dynamicPrice(movie.price, movie.quantity);
        uint256 orderPrice = SafeMath.mul(_quantity, newPrice);
        
        bytes32 blockHash = block.blockhash(block.number - 1);
        bytes32 groupId = keccak256(msg.sender, _quantity, now, blockHash);
        require(!groups[groupId].available);
        
        address[] memory addresses;
        groups[groupId] = MoviesLib.MovieGroupBuy({
            groupId: groupId,
            movieId: _movieId,
            quantity: _quantity,
            totalPrice: orderPrice,
            remainingPrice: orderPrice,
            available: true,
            finished: false,
            users: addresses
        });
        userGroups[msg.sender].push(groupId);
        groupIds.push(groupId);
        
        emit CreateGroup(msg.sender, _movieId, _quantity, orderPrice);
        
        return groupId;
    }
    
    /**
    * @dev This function is made for group buying a movie if the group doesn't exist, is finished 
    *       or the tokens sent are less trown an error
    * 
    * @param _groupId The id of the group
    * @param _tokens The tokens sent
    */
    function groupBuyMovie(
        bytes32 _groupId,
        uint256 _tokens,
        address tokenOwner
    )
        public
        IsGroupAvailable(_groupId)
        IsGroupNotFinished(_groupId)
    {
        MoviesLib.MovieGroupBuy storage group = groups[_groupId];

        // Check if tokens sent are less or equal than zero
        require(_tokens > 0);
        
        if(_tokens >= group.remainingPrice) {
            movies[group.movieId].groupBuy(group);
            group.finished = true;
            _tokens = group.remainingPrice;
            group.remainingPrice = 0;
        }
        else {
            // Subtract from the remaining tokens
            group.remainingPrice -= _tokens;   
        }
        if(tokenOwner != address(0)) {
            group.users.push(tokenOwner);
            group.userTokens[tokenOwner] += _tokens;
            transferFrom(tokenOwner, owner, _tokens);
        } else {
            group.users.push(msg.sender);
            group.userTokens[msg.sender] += _tokens;
            transfer(owner, _tokens);
        }
    }
    
    /**
    * @dev This function is made for liking a movie if the movie doesn't exist 
    *       or the user have already liked the movie trown an error
    * 
    * @param _id The id of the movie
    */
    function likeMovie(bytes32 _id) 
        public
        IsMovieAvailable(_id)
        IsUserNotLikedMovie(_id)
    {
        movies[_id].like();
    }
    
    /**
    * @dev This function is made for getting all the movie identifiers
    */
    function getMovieIds() view public returns(bytes32[]) {
        return movieIds;
    }
    
    /**
    * @dev This function is made for getting all the group identifiers
    */
    function getGroupIds() view public returns(bytes32[]) {
        return groupIds;
    }
    
    /**
    * @dev This function is made for getting the current balance of the contract
    * 
    * @return balance The current balance of the contract
    */
    function getBalance() view public returns(uint256 balance) {
        return address(this).balance;
    }
    
    /**
    * @dev This function is made for withdrawing amount of the contract balance
    *       if didn't call from the owner trown an error
    * 
    * @param _amount The amount to withdraw
    */
    function withdrawAmount(uint256 _amount) onlyOwner public {
        uint currentBalance = address(this).balance;
        require(_amount <= address(this).balance);
        
        owner.transfer(_amount);
        assert(SafeMath.sub(currentBalance, _amount) == address(this).balance);
        
        emit Withdraw(owner, _amount);
    }
    
    /**
    * @dev This function is made for withdrawing the whole amount of the contract balance
    *       if didn't call from the owner trown an error
    */
    function withdraw() onlyOwner public {
        uint currentBalance = address(this).balance;
        
        owner.transfer(address(this).balance);
        assert(address(this).balance == 0);
        
        emit Withdraw(owner, currentBalance);
    }
    
    /**
    * @dev This function is made for destructing the contract
    *       if didn't call from the owner trown an error
    */
    function kill() onlyOwner public {
        selfdestruct(owner);
    }
    
    /**
    * @dev This function is made for get the movie price according to the needed quantity
    * 
    * @param price The price of the movie
    * @param quantity The needed quantity of the movie
    * 
    * @return newPrice The calculated price of the movie according to the quantity
    */
    function dynamicPrice(uint256 price, uint256 quantity) private pure returns(uint256 newPrice) {
        if(quantity >= 10 && quantity <= 25) {
            price = SafeMath.mul(price, 2);
        } else if(quantity >= 5 && quantity < 10) {
            price = SafeMath.mul(price, 3);
        } else if(quantity < 5) {
            price = SafeMath.mul(price, 4);
        }
        
        return price;
    }
}