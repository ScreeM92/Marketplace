pragma solidity 0.4.21;

import './SafeMath.sol';

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
        address[] users,
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
    function like(Movie storage self) public {
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