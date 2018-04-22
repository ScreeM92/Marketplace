pragma solidity 0.4.21;

import './SafeMath.sol';
import './MoviesLib.sol';
import './Ownable.sol';
import './TokenERC20.sol';

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
    function Marketplace() TokenERC20(initialSupply, tokenName, tokenSymbol) public {}
    
    /**
    * @notice  Buy tokens from contract by sending ether
    */
    function buyTokens() payable public {
        require(msg.value / 1 ether > 0); //at least 1 ether
        require((msg.value % 1 ether) == 0); //accept only round ETH
        
        uint256 tokens = SafeMath.mul((msg.value / 1 ether), tokenPrice) ; // calculates the amount
        transfer(owner, msg.sender, tokens); // makes the transfers
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
        require(orderPrice <= balanceOf[msg.sender]);
        
        transfer(msg.sender, owner, orderPrice); // makes the transfers
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
    *       or the tokens sent is less trown an error
    * 
    * @param _groupId The id of the group
    * @param _tokens The tokens sent
    */
    function groupBuyMovie(
        bytes32 _groupId,
        uint256 _tokens
    )
        public
        IsGroupAvailable(_groupId)
        IsGroupNotFinished(_groupId)
    {
        MoviesLib.MovieGroupBuy storage group = groups[_groupId];

        // Check if tokens sent are less than zero
        require(_tokens > 0);
        // Check if the sender has enough
        require(balanceOf[msg.sender] >= _tokens);
        
        if(group.userTokens[msg.sender] == 0) {
            group.users.push(msg.sender);
        }
        
        if(_tokens >= group.remainingPrice) {
            // Subtract from the sender
            balanceOf[msg.sender] -= group.remainingPrice;
            group.userTokens[msg.sender] += group.remainingPrice;

            movies[group.movieId].groupBuy(group);

            transferTo(owner, group.remainingPrice);
            group.remainingPrice = 0;
            group.finished = true;
        }
        else {
            group.userTokens[msg.sender] += _tokens;
            // Subtract from the sender
            balanceOf[msg.sender] -= _tokens;
            // Subtract from the remaining tokens
            group.remainingPrice -= _tokens;   

            transferTo(owner, _tokens); 
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
    function dynamicPrice(uint256 price, uint256 quantity) public pure returns(uint256 newPrice) {
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