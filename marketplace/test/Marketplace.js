const Marketplace = artifacts.require("Marketplace");

const increaseTime = function(duration) {
  const id = Date.now()

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: id,
    }, err1 => {
      if (err1) return reject(err1)

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: (id + 1),
      }, (err2, res) => {
        return err2 ? reject(err2) : resolve(res)
      })
    })
  })
}

const expectThrow = async function(promise) {
  try {
    let result = await promise;
  } catch (error) {
    const invalidJump = error.message.search('invalid JUMP') >= 0
    const invalidOpcode = error.message.search('invalid opcode') >= 0
    const outOfGas = error.message.search('out of gas') >= 0
    const revert = error.message.search('revert') >= 0
    assert(invalidJump || invalidOpcode || outOfGas || revert, "Expected throw, got '" + error + "' instead")
    return
  }

  assert.fail('Expected throw not received');
}

contract('Marketplace tests', async (accounts) => {
  it("should get movie", async () => {
    let instance = await Marketplace.deployed();  
    let account = accounts[0];

    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        movieLikes = 0;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account })
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();

    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');
  });

  it("should fail to get nonexistent movie", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let nonexistentMovieId = "0x0c27b811f042ea00883adc096175d41040bc4d35b96a56ea796624a878013412";

    
    await expectThrow(instance.getMovie.call(nonexistentMovieId, { from: account}));
  });
  
  it("should add movie", async () => {
    let instance = await Marketplace.deployed();  
	  let account = accounts[0];
    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        movieLikes = 0;

    await increaseTime(1);
    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');

    movieArr[4] = movieArr[4].toNumber();
    movieArr[5] = movieArr[5].toNumber();
    movieArr[6] = movieArr[6].toNumber();

    let dynamicPriceVal = await instance.dynamicPrice.call(price, quantity, { from: account });
    let dynamicPriceNumber = dynamicPriceVal.toNumber();
    let expectedMovie = ["movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", dynamicPriceNumber, quantity, movieLikes];
    assert.deepEqual(movieArr, expectedMovie, ['The added movie is not equal to the send one!'])
  });

  it("should fail if not owner try to add movie", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[1];
    let price = 34,
        quantity = 15;

    await expectThrow(instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account }));
  });

  it("should fail to add movie with incorrect movie title length", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 15

    await expectThrow(instance.addMovie("", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account }));
  });

  it("should fail to add movie with incorrect category length", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 15;

    await expectThrow(instance.addMovie("movie title", "", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account }));
  });

  it("should fail to add movie with incorrect description length", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 15;

    await expectThrow(instance.addMovie("movie title", "Action", "", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account }));
  });

  it("should fail to add movie with incorrect img url length", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 15;

    await expectThrow(instance.addMovie("movie title", "Action", "nai qkiq film", "", price, quantity, { from: account }));
  });

  it("should fail to add movie with incorrect price", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 0,
        quantity = 15;

    await expectThrow(instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account }));
});

it("should fail to add movie with incorrect quantity", async () => {
  let instance = await Marketplace.new();  
  let account = accounts[0];
  let price = 34,
      quantity = 0;

  await expectThrow(instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account }));
});

// Case quantity > 25
it("should get movie price with bigger quantity", async () => {
  let instance = await Marketplace.new();  
  let account = accounts[0];
  let price = 34,
      movieArrLength = 7,
      quantity = 100;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');

    movieArr[4] = movieArr[4].toNumber();
    movieArr[5] = movieArr[5].toNumber();
    movieArr[6] = movieArr[6].toNumber();

    let moviePrice = await instance.getMoviePrice.call(movieId, quantity, { from: account });
    let moviePriceNumber = moviePrice.toNumber();

    let dynamicPriceVal = await instance.dynamicPrice.call(price, quantity, { from: account });
    let dynamicPriceNumber = dynamicPriceVal.toNumber();

    assert.equal(moviePriceNumber, dynamicPriceNumber, "The movie price have to be " + dynamicPriceNumber);
  });

  // Case quantity >= 10 and quantity <= 25
  it("should get movie price with big quantity", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 20,
        movieArrLength = 7;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');

    movieArr[4] = movieArr[4].toNumber();
    movieArr[5] = movieArr[5].toNumber();
    movieArr[6] = movieArr[6].toNumber();

    let moviePrice = await instance.getMoviePrice.call(movieId, quantity, { from: account });
    let moviePriceNumber = moviePrice.toNumber();

    let dynamicPriceVal = await instance.dynamicPrice.call(price, quantity, { from: account });
    let dynamicPriceNumber = dynamicPriceVal.toNumber();

    assert.equal(moviePriceNumber, dynamicPriceNumber, "The movie price have to be " + dynamicPriceNumber);
  });

  // Case quantity >= 5 and quantity < 10
  it("should get movie price with medium quantity", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 7,
        movieArrLength = 7;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');

    movieArr[4] = movieArr[4].toNumber();
    movieArr[5] = movieArr[5].toNumber();
    movieArr[6] = movieArr[6].toNumber();

    let moviePrice = await instance.getMoviePrice.call(movieId, quantity, { from: account });
    let moviePriceNumber = moviePrice.toNumber();

    let dynamicPriceVal = await instance.dynamicPrice.call(price, quantity, { from: account });
    let dynamicPriceNumber = dynamicPriceVal.toNumber();

    assert.equal(moviePriceNumber, dynamicPriceNumber, "The movie price have to be " + dynamicPriceNumber);
  });

  // Case quantity < 5
  it("should get movie price with small quantity", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 3,
        movieArrLength = 7;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');

    movieArr[4] = movieArr[4].toNumber();
    movieArr[5] = movieArr[5].toNumber();
    movieArr[6] = movieArr[6].toNumber();

    let moviePrice = await instance.getMoviePrice.call(movieId, quantity, { from: account });
    let moviePriceNumber = moviePrice.toNumber();

    let dynamicPriceVal = await instance.dynamicPrice.call(price, quantity, { from: account });
    let dynamicPriceNumber = dynamicPriceVal.toNumber();

    assert.equal(moviePriceNumber, dynamicPriceVal, "The movie price have to be " + dynamicPriceVal);
  });

  it("should fail to get the price of nonexistent movie", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        nonexistentMovieId = "0x0c27b811f042ea00883adc096175d41040bc4d35b96a56ea796624a878013412";

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');

    await expectThrow(instance.getMoviePrice.call(nonexistentMovieId, quantity, { from: account }));
  });

  it("should fail to get the price of movie with more quantity than available", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 15,
        newQuantity = 20,
        movieArrLength = 7,
        movieLikes = 0;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');

    await expectThrow(instance.getMoviePrice.call(movieId, newQuantity, { from: account }));
  });

  it("should edit movie", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];

    let price = 34,
        quantity = 15,
        newPrice = 50,
        newQuantity = 10,
        movieArrLength = 7,
        movieLikes = 0;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let resultEdit = await instance.editMovie(movieId, "movie title1", "Action1", "nai qkiq film1", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", newPrice, newQuantity, { from: account });
    let eventsEdit = resultEdit.logs;
    assert.isArray(eventsEdit, 'Events is not array!');
    assert.lengthOf(eventsEdit, 1, 'The Events array has length of 1!');

    let eventEdit = eventsEdit[0];
    assert.equal(eventEdit.event, "EditMovie", "Expected AddMovie event");
    assert.equal(eventEdit.args.title, "movie title1", "Expected movie title is the title");
    assert.equal(eventEdit.args.price.toNumber(), newPrice, "Expected " + newPrice +" is the price");
    assert.equal(eventEdit.args.quantity.toNumber(), newQuantity, "Expected " + newQuantity +" is the quantity");

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');

    movieArr[4] = movieArr[4].toNumber();
    movieArr[5] = movieArr[5].toNumber();
    movieArr[6] = movieArr[6].toNumber();
    
    let dynamicPriceVal = await instance.dynamicPrice.call(newPrice, newQuantity, { from: account });
    let dynamicPriceNumber = dynamicPriceVal.toNumber();
    let expectedMovie = ["movie title1", "Action1", "nai qkiq film1", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", dynamicPriceNumber, newQuantity, movieLikes];
    assert.deepEqual(movieArr, expectedMovie, ['The edit movie is not equal to the send one!']);
  });

  it("should fail if not owner try to edit movie", async () => {
    let instance = await Marketplace.deployed();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        newPrice = 50,
        newQuantity = 10,
        movieArrLength = 7;

    await increaseTime(1);
    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    await expectThrow(instance.editMovie(movieId, "movie title1", "Action1", "nai qkiq film1", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", newPrice, newQuantity, { from: accountTwo })); 
  });

  it("should fail if try to edit nonexistent movie", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let nonexistentMovieId = "0x0c27b811f042ea00883adc096175d41040bc4d35b96a56ea796624a878013412";

    let newPrice = 50,
        newQuantity = 10;

    await expectThrow(instance.editMovie(nonexistentMovieId, "movie title1", "Action1", "nai qkiq film1", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", newPrice, newQuantity, { from: account })); 
  });

  it("should fail if try to edit movie with incorrect title", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        newPrice = 50,
        newQuantity = 10,
        movieArrLength = 7;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    await expectThrow(instance.editMovie(movieId, "", "Action1", "nai qkiq film1", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", newPrice, newQuantity, { from: account })); 
  });

  it("should fail if try to edit movie with incorrect category", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        newPrice = 50,
        newQuantity = 10,
        movieArrLength = 7;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    await expectThrow(instance.editMovie(movieId, "movie title1", "", "nai qkiq film1", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", newPrice, newQuantity, { from: account })); 
  });

  it("should fail if try to edit movie with incorrect description", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        newPrice = 50,
        newQuantity = 10,
        movieArrLength = 7;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    await expectThrow(instance.editMovie(movieId, "movie title1", "Action", "", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", newPrice, newQuantity, { from: account })); 
  });

  it("should fail if try to edit movie with incorrect img url", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        newPrice = 50,
        newQuantity = 10,
        movieArrLength = 7;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    await expectThrow(instance.editMovie(movieId, "movie title1", "Action", "nai qkiq film", "", newPrice, newQuantity, { from: account })); 
  });

  it("should fail if try to edit movie with incorrect price", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        newPrice = 0,
        newQuantity = 10,
        movieArrLength = 7;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    await expectThrow(instance.editMovie(movieId, "movie title1", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", newPrice, newQuantity, { from: account })); 
  });

  it("should fail if try to edit movie with incorrect quantity", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        newPrice = 50,
        newQuantity = 0,
        movieArrLength = 7;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    await expectThrow(instance.editMovie(movieId, "movie title1", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", newPrice, newQuantity, { from: account })); 
  });

  it("should buy movie whole quantity", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        amount = 2000000000000000000,
        ether = 1000000000000000000,
        gasAmount = 4712388;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');
    let newPrice = movieArr[4].toNumber();

    //buy tokens
    let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
    let tokenPriceNumber = tokenPrice.toNumber();

    let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount, gas: gasAmount });
    let eventsTokens = resultTokens.logs;

    assert.isArray(eventsTokens, 'Events is not array!');
    assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

    let eventTokens = eventsTokens[0],
        tokens = tokenPriceNumber * (amount / ether);
    assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokens.args.from, account, "Expected from is " + account);
    assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    let resultBuy = await instance.buyMovie(movieId, 15, { from: accountTwo, gas: gasAmount });
    let eventsBuy = resultBuy.logs;
    assert.isArray(eventsBuy, 'Events is not array!');
    assert.lengthOf(eventsBuy, 2, 'The Events array has length of 2!');

    let eventTransfer = eventsBuy[0],
        transferTokens = newPrice * quantity;
    assert.equal(eventTransfer.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTransfer.args.from, accountTwo, "Expected from is " + accountTwo);
    assert.equal(eventTransfer.args.to, account, "Expected address is " + account);
    assert.equal(eventTransfer.args.value.toNumber(), transferTokens, "Expected tokens value is " + transferTokens);

    let eventBuy = eventsBuy[1];
    assert.equal(eventBuy.event, "BuyMovie", "Expected BuyMovie event");
    assert.equal(eventBuy.args.buyer, accountTwo, "Expected buyer is " + accountTwo);
    assert.equal(eventBuy.args.title, "movie title", "Expected movie title is the title");
    assert.equal(eventBuy.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(eventBuy.args.oldQuantity.toNumber(), quantity, "Expected " + quantity +" is the old quantity");
    assert.equal(eventBuy.args.newQuantity.toNumber(), 0, "Expected 0 is the new quantity");

    let newMovie = await instance.getMovie.call(movieId, { from: account});
    let newMovieArr = newMovie.valueOf();

    let currentQuantity = newMovieArr[5].toNumber();
    assert.equal(currentQuantity, 0, "The current quantity have to be 0!");
  });

  it("should buy movie less quantity", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        buyQuantity = 10,
        movieArrLength = 7,
        amount = 2000000000000000000,
        ether = 1000000000000000000,
        gasAmount = 4712388;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');
    let newPrice = movieArr[4].toNumber();

    //buy tokens
    let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
    let tokenPriceNumber = tokenPrice.toNumber();

    let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount, gas: gasAmount });
    let eventsTokens = resultTokens.logs;

    assert.isArray(eventsTokens, 'Events is not array!');
    assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

    let eventTokens = eventsTokens[0],
        tokens = tokenPriceNumber * (amount / ether);
    assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokens.args.from, account, "Expected from is " + account);
    assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    let resultBuy = await instance.buyMovie(movieId, buyQuantity, { from: accountTwo, gas: gasAmount });
    let eventsBuy = resultBuy.logs;
    assert.isArray(eventsBuy, 'Events is not array!');
    assert.lengthOf(eventsBuy, 2, 'The Events array has length of 2!');

    let eventTransfer = eventsBuy[0],
        transferTokens = newPrice * buyQuantity;
    assert.equal(eventTransfer.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTransfer.args.from, accountTwo, "Expected from is " + accountTwo);
    assert.equal(eventTransfer.args.to, account, "Expected address is " + account);
    assert.equal(eventTransfer.args.value.toNumber(), transferTokens, "Expected tokens value is " + transferTokens);

    let eventBuy = eventsBuy[1];
    assert.equal(eventBuy.event, "BuyMovie", "Expected BuyMovie event");
    assert.equal(eventBuy.args.buyer, accountTwo, "Expected buyer is " + accountTwo);
    assert.equal(eventBuy.args.title, "movie title", "Expected movie title is the title");
    assert.equal(eventBuy.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(eventBuy.args.oldQuantity.toNumber(), quantity, "Expected " + quantity +" is the old quantity");
    assert.equal(eventBuy.args.newQuantity.toNumber(), (quantity - buyQuantity), "Expected " + (quantity - buyQuantity) + " is the new quantity");

    let newMovie = await instance.getMovie.call(movieId, { from: account});
    let newMovieArr = newMovie.valueOf();
    let currentQuantity = newMovieArr[5].toNumber(),
        newQuantity = quantity - buyQuantity;

    assert.equal(currentQuantity, newQuantity, "The current quantity have to be " + newQuantity);
  });

  it("should fail because of buy movie more than existing quantity", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        buyQuantity = 20,
        movieArrLength = 7,
        amount = 2000000000000000000,
        ether = 1000000000000000000,
        gasAmount = 4712388;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');  

    //buy tokens
    let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
    let tokenPriceNumber = tokenPrice.toNumber();

    let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount, gas: gasAmount });
    let eventsTokens = resultTokens.logs;

    assert.isArray(eventsTokens, 'Events is not array!');
    assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

    let eventTokens = eventsTokens[0],
        tokens = tokenPriceNumber * (amount / ether);
    assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokens.args.from, account, "Expected from is " + account);
    assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    await expectThrow(instance.buyMovie(movieId, buyQuantity, { from: accountTwo, gas: gasAmount }));
  });

  it("should fail because of buy movie with less tokens", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        amount = 1000000000000000000,
        ether = 1000000000000000000,
        gasAmount = 4712388;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');  

    //buy tokens
    let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
    let tokenPriceNumber = tokenPrice.toNumber();

    let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount, gas: gasAmount });
    let eventsTokens = resultTokens.logs;

    assert.isArray(eventsTokens, 'Events is not array!');
    assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

    let eventTokens = eventsTokens[0],
        tokens = tokenPriceNumber * (amount / ether);
    assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokens.args.from, account, "Expected from is " + account);
    assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    // 1020 is needed
    await expectThrow(instance.buyMovie(movieId, quantity, { from: accountTwo, gas: gasAmount }));
  });

  it("should fail to buy nonexistent movie", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        amount = 2000000000000000000,
        ether = 1000000000000000000,
        gasAmount = 4712388,
        nonexistentMovieId = "0x0c27b811f042ea00883adc096175d41040bc4d35b96a56ea796624a878013412";

    //buy tokens
    let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
    let tokenPriceNumber = tokenPrice.toNumber();

    let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount, gas: gasAmount });
    let eventsTokens = resultTokens.logs;

    assert.isArray(eventsTokens, 'Events is not array!');
    assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

    let eventTokens = eventsTokens[0],
        tokens = tokenPriceNumber * (amount / ether);
    assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokens.args.from, account, "Expected from is " + account);
    assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    await expectThrow(instance.buyMovie(nonexistentMovieId, quantity, { from: account, gas: gasAmount }));
  });

  it("should get movie ids", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        movieLikes = 0;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");


    let resultTwo = await instance.addMovie("movie title1", "Action1", "nai qkiq film1", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let eventsTwo = resultTwo.logs;
    assert.isArray(eventsTwo, 'Events is not array!');
    assert.lengthOf(eventsTwo, 1, 'The Events array has length of 1!');

    let eventTwo = eventsTwo[0];
    assert.equal(eventTwo.event, "AddMovie", "Expected AddMovie event");
    assert.equal(eventTwo.args.title, "movie title1", "Expected movie title1 is the title");
    assert.equal(eventTwo.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(eventTwo.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let firstMovieId = movieIds[0],
        secondMovieId = movieIds[1];

    assert.isString(firstMovieId, 'Movie Id is not string!');
    assert.isString(secondMovieId, 'Movie Id is not string!');
    assert.lengthOf(movieIds, 2, "The movie ids array has length of 2!");  
  });

  it("should like movie", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];

    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        movieLikes = 1;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let resultLike = await instance.likeMovie(movieId, { from: account });
    let eventsLike = resultLike.logs;
    assert.isArray(eventsLike, 'Events is not array!');
    assert.lengthOf(eventsLike, 1, 'The Events array has length of 1!');

    let eventLike = eventsLike[0];
    assert.equal(eventLike.event, "LikeMovie", "Expected LikeMovie event");
    assert.equal(eventLike.args.user, account, "Expected user is " + account);
    assert.equal(eventLike.args.title, "movie title", "Expected movie title is the title");
    assert.equal(eventLike.args.likes, movieLikes, "Expected like is " + movieLikes);

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');

    movieArr[4] = movieArr[4].toNumber();
    movieArr[5] = movieArr[5].toNumber();
    movieArr[6] = movieArr[6].toNumber();
    
    let dynamicPriceVal = await instance.dynamicPrice.call(price, quantity, { from: account });
    let dynamicPriceNumber = dynamicPriceVal.toNumber();
    let expectedMovie = ["movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", dynamicPriceNumber, quantity, movieLikes];
    assert.deepEqual(movieArr, expectedMovie, ['The edit movie is not equal to the send one!'])
  });

  it("should fail because of like nonexistent movie", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let nonexistentMovieId = "0x0c27b811f042ea00883adc096175d41040bc4d35b96a56ea796624a878013412";

    await expectThrow(instance.likeMovie(nonexistentMovieId, { from: account })); 
  });

  it("should fail because of the user likes movie twice", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];

    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        movieLikes = 1;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let resultLike = await instance.likeMovie(movieId, { from: account })
    let eventsLike = resultLike.logs;
    assert.isArray(eventsLike, 'Events is not array!');
    assert.lengthOf(eventsLike, 1, 'The Events array has length of 1!');

    let eventLike = eventsLike[0];
    assert.equal(eventLike.event, "LikeMovie", "Expected LikeMovie event");
    assert.equal(eventLike.args.user, account, "Expected user is " + account);
    assert.equal(eventLike.args.title, "movie title", "Expected movie title is the title");
    assert.equal(eventLike.args.likes, movieLikes, "Expected like is " + movieLikes);

    await expectThrow(instance.likeMovie(movieId, { from: account }));
  });

  it("should two users like movie", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        movieLikes = 2;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let resultLike = await instance.likeMovie(movieId, { from: account })
    let eventsLike = resultLike.logs;
    assert.isArray(eventsLike, 'Events is not array!');
    assert.lengthOf(eventsLike, 1, 'The Events array has length of 1!');

    let eventLike = eventsLike[0];
    assert.equal(eventLike.event, "LikeMovie", "Expected LikeMovie event");
    assert.equal(eventLike.args.user, account, "Expected user is " + account);
    assert.equal(eventLike.args.title, "movie title", "Expected movie title is the title");
    assert.equal(eventLike.args.likes, 1, "Expected like is " + 1);

    let resultLikeTwo = await instance.likeMovie(movieId, { from: accountTwo })
    let eventsLikeTwo = resultLikeTwo.logs;
    assert.isArray(eventsLikeTwo, 'Events is not array!');
    assert.lengthOf(eventsLikeTwo, 1, 'The Events array has length of 1!');

    let eventLikeTwo = eventsLikeTwo[0];
    assert.equal(eventLikeTwo.event, "LikeMovie", "Expected LikeMovie event");
    assert.equal(eventLikeTwo.args.user, accountTwo, "Expected user is " + accountTwo);
    assert.equal(eventLikeTwo.args.title, "movie title", "Expected movie title is the title");
    assert.equal(eventLikeTwo.args.likes, movieLikes, "Expected like is " + movieLikes);

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');

    movieArr[4] = movieArr[4].toNumber();
    movieArr[5] = movieArr[5].toNumber();
    movieArr[6] = movieArr[6].toNumber();
    
    let dynamicPriceVal = await instance.dynamicPrice.call(price, quantity, { from: account });
    let dynamicPriceNumber = dynamicPriceVal.toNumber();
    let expectedMovie = ["movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", dynamicPriceNumber, quantity, movieLikes];
    assert.deepEqual(movieArr, expectedMovie, ['The edit movie is not equal to the send one!'])
  });

  it("should the balance increase after buying tokens", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];

    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        amount = 2000000000000000000,
        ether = 1000000000000000000,
        gasAmount = 4712388;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');  

    //buy tokens
    let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
    let tokenPriceNumber = tokenPrice.toNumber();

    let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount, gas: gasAmount });
    let eventsTokens = resultTokens.logs;

    assert.isArray(eventsTokens, 'Events is not array!');
    assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

    let eventTokens = eventsTokens[0],
        tokens = tokenPriceNumber * (amount / ether);
    assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokens.args.from, account, "Expected from is " + account);
    assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);
    
    let balance = await instance.getBalance.call({ from: account});
    assert.equal(balance.toNumber(), amount, "The balance have to be equal to " + amount);
  });

  it("should withdraw amount", async () => {
    let instance = await Marketplace.new();
    let account = accounts[0];
    let accountTwo = accounts[1];
    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        gasAmount = 4712388,
        amount = 2000000000000000000,
        ether = 1000000000000000000;
    
    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');  
    let newPrice = movieArr[4].toNumber();

    //buy tokens
    let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
    let tokenPriceNumber = tokenPrice.toNumber();

    let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount });
    let eventsTokens = resultTokens.logs;

    assert.isArray(eventsTokens, 'Events is not array!');
    assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

    let eventTokens = eventsTokens[0],
        tokens = tokenPriceNumber * (amount / ether);
    assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokens.args.from, account, "Expected from is " + account);
    assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    let resultBuy = await instance.buyMovie(movieId, 15, { from: accountTwo, gas: gasAmount });
    let eventsBuy = resultBuy.logs;
    assert.isArray(eventsBuy, 'Events is not array!');
    assert.lengthOf(eventsBuy, 2, 'The Events array has length of 2!');

    let eventTransfer = eventsBuy[0],
        transferTokens = newPrice * quantity;
    assert.equal(eventTransfer.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTransfer.args.from, accountTwo, "Expected from is " + accountTwo);
    assert.equal(eventTransfer.args.to, account, "Expected address is " + account);
    assert.equal(eventTransfer.args.value.toNumber(), transferTokens, "Expected tokens value is " + transferTokens);

    let eventBuy = eventsBuy[1];
    assert.equal(eventBuy.event, "BuyMovie", "Expected BuyMovie event");
    assert.equal(eventBuy.args.buyer, accountTwo, "Expected buyer is " + accountTwo);
    assert.equal(eventBuy.args.title, "movie title", "Expected movie title is the title");
    assert.equal(eventBuy.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(eventBuy.args.oldQuantity.toNumber(), quantity, "Expected " + quantity +" is the old quantity");
    assert.equal(eventBuy.args.newQuantity.toNumber(), 0, "Expected 0 is the new quantity");

    let resultWithdraw = await instance.withdrawAmount(amount, { from: account});
    let eventsWithdraw = resultWithdraw.logs;
    assert.isArray(eventsWithdraw, 'Events is not array!');
    assert.lengthOf(eventsWithdraw, 1, 'The Events array has length of 1!');

    let eventWithdraw = eventsWithdraw[0];
    assert.equal(eventWithdraw.event, "Withdraw", "Expected Withdraw event");
    assert.equal(eventWithdraw.args.to, account, "Expected withdraw address is " + account);
    assert.equal(eventWithdraw.args.amountWithdrawn.toNumber(), amount, "Expected " + amount +" is the withdrawn amount");
    
    let newBalance = await instance.getBalance.call({ from: account});
    assert.equal(newBalance.toNumber(), 0, "The balance have to be equal to " + amount);
  });

  it("should fail to withdraw bigger amount than existing", async () => {
    let instance = await Marketplace.new();
    let account = accounts[0];
    let accountTwo = accounts[1];
    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        gasAmount = 4712388,
        amount = 2000000000000000000,
        ether = 1000000000000000000;
    
    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');  
    let newPrice = movieArr[4].toNumber();

    //buy tokens
    let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
    let tokenPriceNumber = tokenPrice.toNumber();

    let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount });
    let eventsTokens = resultTokens.logs;

    assert.isArray(eventsTokens, 'Events is not array!');
    assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

    let eventTokens = eventsTokens[0],
        tokens = tokenPriceNumber * (amount / ether);
    assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokens.args.from, account, "Expected from is " + account);
    assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    let resultBuy = await instance.buyMovie(movieId, 15, { from: accountTwo, gas: gasAmount });
    let eventsBuy = resultBuy.logs;
    assert.isArray(eventsBuy, 'Events is not array!');
    assert.lengthOf(eventsBuy, 2, 'The Events array has length of 2!');

    let eventTransfer = eventsBuy[0],
        transferTokens = newPrice * quantity;
    assert.equal(eventTransfer.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTransfer.args.from, accountTwo, "Expected from is " + accountTwo);
    assert.equal(eventTransfer.args.to, account, "Expected address is " + account);
    assert.equal(eventTransfer.args.value.toNumber(), transferTokens, "Expected tokens value is " + transferTokens);

    let eventBuy = eventsBuy[1];
    assert.equal(eventBuy.event, "BuyMovie", "Expected BuyMovie event");
    assert.equal(eventBuy.args.buyer, accountTwo, "Expected buyer is " + accountTwo);
    assert.equal(eventBuy.args.title, "movie title", "Expected movie title is the title");
    assert.equal(eventBuy.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(eventBuy.args.oldQuantity.toNumber(), quantity, "Expected " + quantity +" is the old quantity");
    assert.equal(eventBuy.args.newQuantity.toNumber(), 0, "Expected 0 is the new quantity");

    let balance = await instance.getBalance.call({ from: account});
    assert.equal(balance.toNumber(), amount, "The balance have to be equal to " + amount);

    let withdrawAmount = 3000000000000000000;
    await expectThrow(instance.withdrawAmount(withdrawAmount, { from: account}));
  });

  it("should fail to withdraw amount if isn't contract owner", async () => {
    let instance = await Marketplace.deployed();
    let accountTwo = accounts[1];
    let amount = 1000;
    
    await expectThrow(instance.withdrawAmount(amount, { from: accountTwo}));
  });

  it("should withdraw the whole balance", async () => {
    let instance = await Marketplace.new();
    let account = accounts[0];
    let accountTwo = accounts[1];
    let price = 34,
        quantity = 15,
        movieArrLength = 7,
        gasAmount = 4712388,
        amount = 2000000000000000000,
        ether = 1000000000000000000;
    
    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let movie = await instance.getMovie.call(movieId, { from: account});
    let movieArr = movie.valueOf();
    assert.isArray(movieArr, 'The movie have to be array!');
    assert.lengthOf(movieArr, movieArrLength, 'The movie array has length of 7!');  
    let newPrice = movieArr[4].toNumber();

    //buy tokens
    let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
    let tokenPriceNumber = tokenPrice.toNumber();

    let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount });
    let eventsTokens = resultTokens.logs;

    assert.isArray(eventsTokens, 'Events is not array!');
    assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

    let eventTokens = eventsTokens[0],
        tokens = tokenPriceNumber * (amount / ether);
    assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokens.args.from, account, "Expected from is " + account);
    assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    let resultBuy = await instance.buyMovie(movieId, 15, { from: accountTwo, gas: gasAmount });
    let eventsBuy = resultBuy.logs;
    assert.isArray(eventsBuy, 'Events is not array!');
    assert.lengthOf(eventsBuy, 2, 'The Events array has length of 2!');

    let eventTransfer = eventsBuy[0],
        transferTokens = newPrice * quantity;
    assert.equal(eventTransfer.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTransfer.args.from, accountTwo, "Expected from is " + accountTwo);
    assert.equal(eventTransfer.args.to, account, "Expected address is " + account);
    assert.equal(eventTransfer.args.value.toNumber(), transferTokens, "Expected tokens value is " + transferTokens);

    let eventBuy = eventsBuy[1];
    assert.equal(eventBuy.event, "BuyMovie", "Expected BuyMovie event");
    assert.equal(eventBuy.args.buyer, accountTwo, "Expected buyer is " + accountTwo);
    assert.equal(eventBuy.args.title, "movie title", "Expected movie title is the title");
    assert.equal(eventBuy.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(eventBuy.args.oldQuantity.toNumber(), quantity, "Expected " + quantity +" is the old quantity");
    assert.equal(eventBuy.args.newQuantity.toNumber(), 0, "Expected 0 is the new quantity");
    
    let balance = await instance.getBalance.call({ from: account});
    assert.equal(balance.toNumber(), amount, "The balance have to be equal to " + amount);

    let resultWithdraw = await instance.withdraw({ from: account})
    let eventsWithdraw = resultWithdraw.logs;
    assert.isArray(eventsWithdraw, 'Events is not array!');
    assert.lengthOf(eventsWithdraw, 1, 'The Events array has length of 1!');

    let eventWithdraw = eventsWithdraw[0];
    assert.equal(eventWithdraw.event, "Withdraw", "Expected Withdraw event");
    assert.equal(eventWithdraw.args.to, account, "Expected withdraw address is " + account);
    assert.equal(eventWithdraw.args.amountWithdrawn.toNumber(), amount, "Expected " + amount +" is the withdrawn amount");
    
    let newBalance = await instance.getBalance.call({ from: account});
    assert.equal(newBalance.toNumber(), 0, "The balance have to be equal to 0");
  });

  it("should fail to withdraw if isn't contract owner", async () => {
    let instance = await Marketplace.deployed();
    let accountTwo = accounts[1];
    
    await expectThrow(instance.withdraw({ from: accountTwo}));
  });

  it("should destruct the contract", async () => {
    let instance = await Marketplace.new();
    let account = accounts[0];
    let amount = 1000;
    
    await instance.kill({ from: account});

    try {
      await instance.owner.call({ from: account});
      assert.equal(true, false, "The contract have to be destruct");
    } catch(error) {
      assert.equal(true, true, "The contact is destructed");
    }
  });

  it("should fail to destruct the contract if isn't contract owner", async () => {
    let instance = await Marketplace.deployed();
    let accountTwo = accounts[1];
    let amount = 1000;
    
    await expectThrow(instance.kill({ from: accountTwo}));
  });

  it("should change the contract owner", async () => {
    let instance = await Marketplace.new();
    let account = accounts[0];
    let accountTwo = accounts[1];
    
    let result = await instance.transferOwnership(accountTwo, { from: account })
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "OwnershipTransferred", "Expected OwnershipTransferred event");
    assert.equal(event.args.previousOwner, account, "Expected previous owner is " + account);
    assert.equal(event.args.newOwner, accountTwo, "Expected new owner is " + accountTwo);

    let owner = await instance.owner.call({ from: accountTwo});
    assert.equal(owner, accountTwo, "The contract must have new owner");
  });

  it("should fail to change the contract owner if isn't call from him", async () => {
    let instance = await Marketplace.new();
    let accountTwo = accounts[1];
    let accountThree = accounts[2];
    
    await expectThrow(instance.transferOwnership(accountThree, { from: accountTwo }));
  });

  it("should get the contract owner", async () => {
    let instance = await Marketplace.new();
    let account = accounts[0];
    let accountTwo = accounts[1];

    let owner = await instance.owner.call({ from: accountTwo});
    assert.equal(owner, account, "The contract is not correct");
  });

  it("should create a group for buying movie with whole quantity", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 15;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let resultGroup = await instance.createGroupBuyMovie(movieId, quantity, { from: account });
    let eventsGroup = resultGroup.logs;
    assert.isArray(eventsGroup, 'Events is not array!');
    assert.lengthOf(eventsGroup, 1, 'The Events array has length of 1!');

    let eventGroup = eventsGroup[0];
    assert.equal(eventGroup.event, "CreateGroup", "Expected CreateGroup event");
    assert.equal(eventGroup.args.creator, account, "Expected address is " + account);
    assert.equal(eventGroup.args.movieId, movieId, "Expected " + movieId +" is the movie id");
    assert.equal(eventGroup.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");
  });

  it("should create a group for buying movie with less quantity", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 15,
        quantityGroup = 10;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let resultGroup = await instance.createGroupBuyMovie(movieId, quantityGroup, { from: account });
    let eventsGroup = resultGroup.logs;
    assert.isArray(eventsGroup, 'Events is not array!');
    assert.lengthOf(eventsGroup, 1, 'The Events array has length of 1!');

    let eventGroup = eventsGroup[0];
    assert.equal(eventGroup.event, "CreateGroup", "Expected CreateGroup event");
    assert.equal(eventGroup.args.creator, account, "Expected address is " + account);
    assert.equal(eventGroup.args.movieId, movieId, "Expected " + movieId +" is the movie id");
    assert.equal(eventGroup.args.quantity.toNumber(), quantityGroup, "Expected " + quantityGroup +" is the quantity");
  });

  it("should fail to create a group for buying movie with bigger quantity", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 15,
        quantityGroup = 20;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    await expectThrow(instance.createGroupBuyMovie(movieId, quantityGroup, { from: account }));
  });

  it("should fail to create a group for buying movie with nonexistent movie", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 15,
        nonexistentMovieId = "0x0c27b811f042ea00883adc096175d41040bc4d35b96a56ea796624a878013412";

    await expectThrow(instance.createGroupBuyMovie(nonexistentMovieId, quantity, { from: account }));
  });

  it("should create two groups for buying movie at the same time with whole quantity", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let price = 34,
        quantity = 20,
        quantityGroup = 10;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let resultGroup = await instance.createGroupBuyMovie(movieId, quantityGroup, { from: account });
    let eventsGroup = resultGroup.logs;
    assert.isArray(eventsGroup, 'Events is not array!');
    assert.lengthOf(eventsGroup, 1, 'The Events array has length of 1!');

    let eventGroup = eventsGroup[0];
    assert.equal(eventGroup.event, "CreateGroup", "Expected CreateGroup event");
    assert.equal(eventGroup.args.creator, account, "Expected address is " + account);
    assert.equal(eventGroup.args.movieId, movieId, "Expected " + movieId +" is the movie id");
    assert.equal(eventGroup.args.quantity.toNumber(), quantityGroup, "Expected " + quantityGroup +" is the quantity");

    let resultGroupTwo = await instance.createGroupBuyMovie(movieId, quantityGroup, { from: account });
    let eventsGroupTwo = resultGroupTwo.logs;
    assert.isArray(eventsGroupTwo, 'Events is not array!');
    assert.lengthOf(eventsGroupTwo, 1, 'The Events array has length of 1!');

    let eventGroupTwo = eventsGroupTwo[0];
    assert.equal(eventGroupTwo.event, "CreateGroup", "Expected CreateGroup event");
    assert.equal(eventGroupTwo.args.creator, account, "Expected address is " + account);
    assert.equal(eventGroupTwo.args.movieId, movieId, "Expected " + movieId +" is the movie id");
    assert.equal(eventGroupTwo.args.quantity.toNumber(), quantityGroup, "Expected " + quantityGroup +" is the quantity");
  });

  it("should get group ids", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];
    let price = 34,
        quantity = 20,
        quantityGroup = 10;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let dynamicPriceVal = await instance.dynamicPrice.call(price, quantity, { from: account });
    let dynamicPriceNumber = dynamicPriceVal.toNumber();
    let totalPrice = dynamicPriceNumber * quantityGroup;

    let resultGroup = await instance.createGroupBuyMovie(movieId, quantityGroup, { from: accountTwo });
    let eventsGroup = resultGroup.logs;
    assert.isArray(eventsGroup, 'Events is not array!');
    assert.lengthOf(eventsGroup, 1, 'The Events array has length of 1!');

    let eventGroup = eventsGroup[0];
    assert.equal(eventGroup.event, "CreateGroup", "Expected CreateGroup event");
    assert.equal(eventGroup.args.creator, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventGroup.args.movieId, movieId, "Expected " + movieId +" is the movie id");
    assert.equal(eventGroup.args.quantity.toNumber(), quantityGroup, "Expected " + quantityGroup +" is the quantity");
    assert.equal(eventGroup.args.price.toNumber(), totalPrice, "Expected " + totalPrice +" is the price");

    let resultGroupTwo = await instance.createGroupBuyMovie(movieId, quantityGroup, { from: accountTwo });
    let eventsGroupTwo = resultGroup.logs;
    assert.isArray(eventsGroupTwo, 'Events is not array!');
    assert.lengthOf(eventsGroupTwo, 1, 'The Events array has length of 1!');

    let eventGroupTwo = eventsGroupTwo[0];
    assert.equal(eventGroupTwo.event, "CreateGroup", "Expected CreateGroup event");
    assert.equal(eventGroupTwo.args.creator, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventGroupTwo.args.movieId, movieId, "Expected " + movieId +" is the movie id");
    assert.equal(eventGroupTwo.args.quantity.toNumber(), quantityGroup, "Expected " + quantityGroup +" is the quantity");
    assert.equal(eventGroupTwo.args.price.toNumber(), totalPrice, "Expected " + totalPrice +" is the price");

    let groupIds = await instance.getGroupIds.call({ from: account});
    assert.isArray(groupIds, 'Groups Ids is not array!');
    assert.lengthOf(groupIds, 2, 'The Group array has length of 2!');
  });

  it("should buy the whole quantity of movies in group buying", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];
    let price = 34,
        quantity = 20,
        quantityGroup = 10,
        gasAmount = 4712388,
        amount = 2000000000000000000,
        ether = 1000000000000000000;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let dynamicPriceVal = await instance.dynamicPrice.call(price, quantity, { from: account });
    let dynamicPriceNumber = dynamicPriceVal.toNumber();
    let totalPrice = dynamicPriceNumber * quantityGroup;

    let resultGroup = await instance.createGroupBuyMovie(movieId, quantityGroup, { from: accountTwo });
    let eventsGroup = resultGroup.logs;
    assert.isArray(eventsGroup, 'Events is not array!');
    assert.lengthOf(eventsGroup, 1, 'The Events array has length of 1!');

    let eventGroup = eventsGroup[0];
    assert.equal(eventGroup.event, "CreateGroup", "Expected CreateGroup event");
    assert.equal(eventGroup.args.creator, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventGroup.args.movieId, movieId, "Expected " + movieId +" is the movie id");
    assert.equal(eventGroup.args.quantity.toNumber(), quantityGroup, "Expected " + quantityGroup +" is the quantity");
    assert.equal(eventGroup.args.price.toNumber(), totalPrice, "Expected " + totalPrice +" is the price");

    let groupIds = await instance.getGroupIds.call({ from: account});
    assert.isArray(groupIds, 'Groups Ids is not array!');

    let groupId = groupIds[groupIds.length - 1];
    assert.isString(groupId, 'Group Id is not string!');

    //buy tokens
    let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
    let tokenPriceNumber = tokenPrice.toNumber();

    let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount, gas: gasAmount });
    let eventsTokens = resultTokens.logs;

    assert.isArray(eventsTokens, 'Events is not array!');
    assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

    let eventTokens = eventsTokens[0],
        tokens = tokenPriceNumber * (amount / ether);
    assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokens.args.from, account, "Expected from is " + account);
    assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    let resultGroupBuy = await instance.groupBuyMovie(groupId, tokens, { from: accountTwo });
    let eventsGroupBuy = resultGroupBuy.logs;
    assert.isArray(eventsGroupBuy, 'Events is not array!');
    assert.lengthOf(eventsGroupBuy, 2, 'The Events array has length of 2!');

    let newQuantity = quantity - quantityGroup;
    let eventGroupBuy = eventsGroupBuy[0];
    assert.equal(eventGroupBuy.event, "GroupBuyMovie", "Expected GroupBuyMovie event");
    assert.equal(eventGroupBuy.args.users[0], accountTwo, "Expected addresses are only " + accountTwo);
    assert.equal(eventGroupBuy.args.title, "movie title", "Expected title is movie title");
    assert.equal(eventGroupBuy.args.price.toNumber(), totalPrice, "Expected " + totalPrice +" is the total price");
    assert.equal(eventGroupBuy.args.oldQuantity.toNumber(), quantity, "Expected " + quantity +" is the old quantity");
    assert.equal(eventGroupBuy.args.newQuantity.toNumber(), newQuantity, "Expected " + newQuantity +" is the new quantity");

    let eventGroupTransfer = eventsGroupBuy[1];
    assert.equal(eventGroupTransfer.event, "TransferTo", "Expected TransferTo event");
    assert.equal(eventGroupTransfer.args.to, account, "Expected address is " + account);
    assert.equal(eventGroupTransfer.args.value.toNumber(), totalPrice, "Expected " + totalPrice +" is the value transfered");

    let groupArr = await instance.groups.call(groupId, { from: accountTwo });
    let isFinished = groupArr[6];
    assert.equal(isFinished, true, "Expected the group is finished")
  });

  it("should buy less quantity of movies in group buying", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];
    let price = 34,
        quantity = 20,
        quantityGroup = 10,
        quantityGroupBuy = 5,
        gasAmount = 4712388,
        amount = 2000000000000000000,
        ether = 1000000000000000000,
        sendTokens = 50;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let dynamicPriceVal = await instance.dynamicPrice.call(price, quantity, { from: account });
    let dynamicPriceNumber = dynamicPriceVal.toNumber();
    let totalPrice = dynamicPriceNumber * quantityGroup;

    let resultGroup = await instance.createGroupBuyMovie(movieId, quantityGroup, { from: accountTwo });
    let eventsGroup = resultGroup.logs;
    assert.isArray(eventsGroup, 'Events is not array!');
    assert.lengthOf(eventsGroup, 1, 'The Events array has length of 1!');

    let eventGroup = eventsGroup[0];
    assert.equal(eventGroup.event, "CreateGroup", "Expected CreateGroup event");
    assert.equal(eventGroup.args.creator, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventGroup.args.movieId, movieId, "Expected " + movieId +" is the movie id");
    assert.equal(eventGroup.args.quantity.toNumber(), quantityGroup, "Expected " + quantityGroup +" is the quantity");
    assert.equal(eventGroup.args.price.toNumber(), totalPrice, "Expected " + totalPrice +" is the price");

    let groupIds = await instance.getGroupIds.call({ from: account});
    assert.isArray(groupIds, 'Groups Ids is not array!');

    let groupId = groupIds[groupIds.length - 1];
    assert.isString(groupId, 'Group Id is not string!');

    //buy tokens
    let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
    let tokenPriceNumber = tokenPrice.toNumber();

    let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount, gas: gasAmount });
    let eventsTokens = resultTokens.logs;

    assert.isArray(eventsTokens, 'Events is not array!');
    assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

    let eventTokens = eventsTokens[0],
        tokens = tokenPriceNumber * (amount / ether);
    assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokens.args.from, account, "Expected from is " + account);
    assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    let resultGroupBuy = await instance.groupBuyMovie(groupId, sendTokens, { from: accountTwo });
    let eventsGroupBuy = resultGroupBuy.logs;
    assert.isArray(eventsGroupBuy, 'Events is not array!');
    assert.lengthOf(eventsGroupBuy, 1, 'The Events array has length of 1!');

    let eventGroupTransfer = eventsGroupBuy[0];
    assert.equal(eventGroupTransfer.event, "TransferTo", "Expected TransferTo event");
    assert.equal(eventGroupTransfer.args.to, account, "Expected address is " + account);
    assert.equal(eventGroupTransfer.args.value.toNumber(), sendTokens, "Expected " + sendTokens +" is the value transfered");

    let groupArr = await instance.groups.call(groupId, { from: accountTwo });
    let remainingPrice = groupArr[4].toNumber();
    let groupTotalPrice = groupArr[2].toNumber();
    let isFinished = groupArr[6];
    assert.equal(isFinished, false, "Expected the group is finished");
    assert.equal(remainingPrice, (groupTotalPrice - sendTokens), "Expected the group is finished");
  });

it("should 2 users buy the whole quantity of movies in group buying", async () => {
  let instance = await Marketplace.new();  
  let account = accounts[0];
  let accountTwo = accounts[1];
  let accountThree = accounts[2];
  let price = 34,
      quantity = 20,
      quantityGroup = 10,
      gasAmount = 4712388,
      amount = 2000000000000000000,
      ether = 1000000000000000000,
      sendTokens = 50;

  let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
  let events = result.logs;
  assert.isArray(events, 'Events is not array!');
  assert.lengthOf(events, 1, 'The Events array has length of 1!');

  let event = events[0];
  assert.equal(event.event, "AddMovie", "Expected AddMovie event");
  assert.equal(event.args.title, "movie title", "Expected movie title is the title");
  assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
  assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

  let movieIds = await instance.getMovieIds.call({ from: account});
  assert.isArray(movieIds, 'Movies Ids is not array!');

  let movieId = movieIds[movieIds.length - 1];
  assert.isString(movieId, 'Movie Id is not string!');

  let dynamicPriceVal = await instance.dynamicPrice.call(price, quantity, { from: account });
  let dynamicPriceNumber = dynamicPriceVal.toNumber();
  let totalPrice = dynamicPriceNumber * quantityGroup;

  let resultGroup = await instance.createGroupBuyMovie(movieId, quantityGroup, { from: accountTwo });
  let eventsGroup = resultGroup.logs;
  assert.isArray(eventsGroup, 'Events is not array!');
  assert.lengthOf(eventsGroup, 1, 'The Events array has length of 1!');

  let eventGroup = eventsGroup[0];
  assert.equal(eventGroup.event, "CreateGroup", "Expected CreateGroup event");
  assert.equal(eventGroup.args.creator, accountTwo, "Expected address is " + accountTwo);
  assert.equal(eventGroup.args.movieId, movieId, "Expected " + movieId +" is the movie id");
  assert.equal(eventGroup.args.quantity.toNumber(), quantityGroup, "Expected " + quantityGroup +" is the quantity");
  assert.equal(eventGroup.args.price.toNumber(), totalPrice, "Expected " + totalPrice +" is the price");

  let groupIds = await instance.getGroupIds.call({ from: account});
  assert.isArray(groupIds, 'Groups Ids is not array!');

  let groupId = groupIds[groupIds.length - 1];
  assert.isString(groupId, 'Group Id is not string!');

  //buy tokens accountTwo
  let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
  let tokenPriceNumber = tokenPrice.toNumber();

  let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount, gas: gasAmount });
  let eventsTokens = resultTokens.logs;

  assert.isArray(eventsTokens, 'Events is not array!');
  assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

  let eventTokens = eventsTokens[0],
      tokens = tokenPriceNumber * (amount / ether);
  assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
  assert.equal(eventTokens.args.from, account, "Expected from is " + account);
  assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
  assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

  //buy tokens accountThree
  let resultTokensThree = await instance.buyTokens({ from: accountThree, value: amount, gas: gasAmount });
  let eventsTokensThree  = resultTokensThree.logs;

  assert.isArray(eventsTokensThree, 'Events is not array!');
  assert.lengthOf(eventsTokensThree, 1, 'The Events array has length of 1!');

  let eventTokensThree = eventsTokensThree[0];
  assert.equal(eventTokensThree.event, "Transfer", "Expected Transfer event");
  assert.equal(eventTokensThree.args.from, account, "Expected from is " + account);
  assert.equal(eventTokensThree.args.to, accountThree, "Expected address is " + accountThree);
  assert.equal(eventTokensThree.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

  //account two
  let resultGroupBuy = await instance.groupBuyMovie(groupId, sendTokens, { from: accountTwo });
  let eventsGroupBuy = resultGroupBuy.logs;
  assert.isArray(eventsGroupBuy, 'Events is not array!');
  assert.lengthOf(eventsGroupBuy, 1, 'The Events array has length of 1!');

  let eventGroupTransfer = eventsGroupBuy[0];
  assert.equal(eventGroupTransfer.event, "TransferTo", "Expected TransferTo event");
  assert.equal(eventGroupTransfer.args.to, account, "Expected address is " + account);
  assert.equal(eventGroupTransfer.args.value.toNumber(), sendTokens, "Expected " + sendTokens +" is the value transfered");

  //account three
  let resultGroupBuyThree = await instance.groupBuyMovie(groupId, tokens, { from: accountThree });
  let eventsGroupBuyThree = resultGroupBuyThree.logs;
  assert.isArray(eventsGroupBuyThree, 'Events is not array!');
  assert.lengthOf(eventsGroupBuyThree, 2, 'The Events array has length of 2!');

  let newQuantity = quantity - quantityGroup;
  let eventGroupBuy = eventsGroupBuyThree[0];
  assert.equal(eventGroupBuy.event, "GroupBuyMovie", "Expected GroupBuyMovie event");
  assert.equal(eventGroupBuy.args.users[0], accountTwo, "Expected address is " + accountTwo);
  assert.equal(eventGroupBuy.args.users[1], accountThree, "Expected address is " + accountThree);
  assert.equal(eventGroupBuy.args.title, "movie title", "Expected title is movie title");
  assert.equal(eventGroupBuy.args.price.toNumber(), totalPrice, "Expected " + totalPrice +" is the total price");
  assert.equal(eventGroupBuy.args.oldQuantity.toNumber(), quantity, "Expected " + quantity +" is the old quantity");
  assert.equal(eventGroupBuy.args.newQuantity.toNumber(), newQuantity, "Expected " + newQuantity +" is the new quantity");

  let eventGroupTransferThree = eventsGroupBuyThree[1];
  assert.equal(eventGroupTransferThree.event, "TransferTo", "Expected TransferTo event");
  assert.equal(eventGroupTransferThree.args.to, account, "Expected address is " + account);
  assert.equal(eventGroupTransferThree.args.value.toNumber(), totalPrice - sendTokens, "Expected " + totalPrice +" is the value transfered");

  let groupArr = await instance.groups.call(groupId, { from: accountThree });
  let isFinished = groupArr[6];
  assert.equal(isFinished, true, "Expected the group is finished");
});

it("should 2 users buy less quantity of movies in group buying", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];
    let accountThree = accounts[2];
    let price = 34,
        quantity = 20,
        quantityGroup = 10,
        gasAmount = 4712388,
        amount = 2000000000000000000,
        ether = 1000000000000000000,
        sendTokens = 50;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let dynamicPriceVal = await instance.dynamicPrice.call(price, quantity, { from: account });
    let dynamicPriceNumber = dynamicPriceVal.toNumber();
    let totalPrice = dynamicPriceNumber * quantityGroup;

    let resultGroup = await instance.createGroupBuyMovie(movieId, quantityGroup, { from: accountTwo });
    let eventsGroup = resultGroup.logs;
    assert.isArray(eventsGroup, 'Events is not array!');
    assert.lengthOf(eventsGroup, 1, 'The Events array has length of 1!');

    let eventGroup = eventsGroup[0];
    assert.equal(eventGroup.event, "CreateGroup", "Expected CreateGroup event");
    assert.equal(eventGroup.args.creator, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventGroup.args.movieId, movieId, "Expected " + movieId +" is the movie id");
    assert.equal(eventGroup.args.quantity.toNumber(), quantityGroup, "Expected " + quantityGroup +" is the quantity");
    assert.equal(eventGroup.args.price.toNumber(), totalPrice, "Expected " + totalPrice +" is the price");

    let groupIds = await instance.getGroupIds.call({ from: account});
    assert.isArray(groupIds, 'Groups Ids is not array!');

    let groupId = groupIds[groupIds.length - 1];
    assert.isString(groupId, 'Group Id is not string!');

    //buy tokens accountTwo
    let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
    let tokenPriceNumber = tokenPrice.toNumber();

    let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount, gas: gasAmount });
    let eventsTokens = resultTokens.logs;

    assert.isArray(eventsTokens, 'Events is not array!');
    assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

    let eventTokens = eventsTokens[0],
        tokens = tokenPriceNumber * (amount / ether);
    assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokens.args.from, account, "Expected from is " + account);
    assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    //buy tokens accountThree
    let resultTokensThree = await instance.buyTokens({ from: accountThree, value: amount, gas: gasAmount });
    let eventsTokensThree  = resultTokensThree.logs;

    assert.isArray(eventsTokensThree, 'Events is not array!');
    assert.lengthOf(eventsTokensThree, 1, 'The Events array has length of 1!');

    let eventTokensThree = eventsTokensThree[0];
    assert.equal(eventTokensThree.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokensThree.args.from, account, "Expected from is " + account);
    assert.equal(eventTokensThree.args.to, accountThree, "Expected address is " + accountThree);
    assert.equal(eventTokensThree.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    //account two
    let resultGroupBuy = await instance.groupBuyMovie(groupId, sendTokens, { from: accountTwo });
    let eventsGroupBuy = resultGroupBuy.logs;
    assert.isArray(eventsGroupBuy, 'Events is not array!');
    assert.lengthOf(eventsGroupBuy, 1, 'The Events array has length of 1!');

    let eventGroupTransfer = eventsGroupBuy[0];
    assert.equal(eventGroupTransfer.event, "TransferTo", "Expected TransferTo event");
    assert.equal(eventGroupTransfer.args.to, account, "Expected address is " + account);
    assert.equal(eventGroupTransfer.args.value.toNumber(), sendTokens, "Expected " + sendTokens +" is the value transfered");

    //account three
    let resultGroupBuyThree = await instance.groupBuyMovie(groupId, sendTokens, { from: accountThree });
    let eventsGroupBuyThree = resultGroupBuyThree.logs;
    assert.isArray(eventsGroupBuyThree, 'Events is not array!');
    assert.lengthOf(eventsGroupBuyThree, 1, 'The Events array has length of 1!');

    let eventGroupTransferThree = eventsGroupBuyThree[0];
    assert.equal(eventGroupTransferThree.event, "TransferTo", "Expected TransferTo event");
    assert.equal(eventGroupTransferThree.args.to, account, "Expected address is " + account);
    assert.equal(eventGroupTransferThree.args.value.toNumber(), sendTokens, "Expected " + sendTokens +" is the value transfered");

    let groupArr = await instance.groups.call(groupId, { from: accountThree });
    let isFinished = groupArr[6];
    let remainingPrice = groupArr[4];
    assert.equal(isFinished, false, "Expected the group is finished");
    assert.equal(remainingPrice, totalPrice - (2 * sendTokens), "Expected remaining price is " + totalPrice - (2 * sendTokens));
  });

  it("should fail to buy movie in nonexistent group", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let nonexistentGroupId = "0x0c27b811f042ea00883adc096175d41040bc4d35b96a56ea796624a878013412",
        sendTokens = 50;

    await expectThrow(instance.groupBuyMovie(nonexistentGroupId, sendTokens, { from: account }));
  });

  it("should fail to buy less quantity of movie in finished group", async () => {
    let instance = await Marketplace.new();  
    let account = accounts[0];
    let accountTwo = accounts[1];
    let accountThree = accounts[2];
    let price = 34,
        quantity = 20,
        quantityGroup = 10,
        gasAmount = 4712388,
        amount = 2000000000000000000,
        ether = 1000000000000000000,
        sendTokens = 50;

    let result = await instance.addMovie("movie title", "Action", "nai qkiq film", "https://upload.wikimedia.org/wikipedia/en/4/4c/Batman_under_the_red_hood_poster.jpg", price, quantity, { from: account });
    let events = result.logs;
    assert.isArray(events, 'Events is not array!');
    assert.lengthOf(events, 1, 'The Events array has length of 1!');

    let event = events[0];
    assert.equal(event.event, "AddMovie", "Expected AddMovie event");
    assert.equal(event.args.title, "movie title", "Expected movie title is the title");
    assert.equal(event.args.price.toNumber(), price, "Expected " + price +" is the price");
    assert.equal(event.args.quantity.toNumber(), quantity, "Expected " + quantity +" is the quantity");

    let movieIds = await instance.getMovieIds.call({ from: account});
    assert.isArray(movieIds, 'Movies Ids is not array!');

    let movieId = movieIds[movieIds.length - 1];
    assert.isString(movieId, 'Movie Id is not string!');

    let dynamicPriceVal = await instance.dynamicPrice.call(price, quantity, { from: account });
    let dynamicPriceNumber = dynamicPriceVal.toNumber();
    let totalPrice = dynamicPriceNumber * quantityGroup;

    let resultGroup = await instance.createGroupBuyMovie(movieId, quantityGroup, { from: accountTwo });
    let eventsGroup = resultGroup.logs;
    assert.isArray(eventsGroup, 'Events is not array!');
    assert.lengthOf(eventsGroup, 1, 'The Events array has length of 1!');

    let eventGroup = eventsGroup[0];
    assert.equal(eventGroup.event, "CreateGroup", "Expected CreateGroup event");
    assert.equal(eventGroup.args.creator, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventGroup.args.movieId, movieId, "Expected " + movieId +" is the movie id");
    assert.equal(eventGroup.args.quantity.toNumber(), quantityGroup, "Expected " + quantityGroup +" is the quantity");
    assert.equal(eventGroup.args.price.toNumber(), totalPrice, "Expected " + totalPrice +" is the price");

    let groupIds = await instance.getGroupIds.call({ from: account});
    assert.isArray(groupIds, 'Groups Ids is not array!');

    let groupId = groupIds[groupIds.length - 1];
    assert.isString(groupId, 'Group Id is not string!');

    //buy tokens accountTwo
    let tokenPrice = await instance.tokenPrice.call({ from: accountTwo });
    let tokenPriceNumber = tokenPrice.toNumber();

    let resultTokens = await instance.buyTokens({ from: accountTwo, value: amount, gas: gasAmount });
    let eventsTokens = resultTokens.logs;

    assert.isArray(eventsTokens, 'Events is not array!');
    assert.lengthOf(eventsTokens, 1, 'The Events array has length of 1!');

    let eventTokens = eventsTokens[0],
        tokens = tokenPriceNumber * (amount / ether);
    assert.equal(eventTokens.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokens.args.from, account, "Expected from is " + account);
    assert.equal(eventTokens.args.to, accountTwo, "Expected address is " + accountTwo);
    assert.equal(eventTokens.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    //buy tokens accountThree
    let resultTokensThree = await instance.buyTokens({ from: accountThree, value: amount, gas: gasAmount });
    let eventsTokensThree  = resultTokensThree.logs;

    assert.isArray(eventsTokensThree, 'Events is not array!');
    assert.lengthOf(eventsTokensThree, 1, 'The Events array has length of 1!');

    let eventTokensThree = eventsTokensThree[0];
    assert.equal(eventTokensThree.event, "Transfer", "Expected Transfer event");
    assert.equal(eventTokensThree.args.from, account, "Expected from is " + account);
    assert.equal(eventTokensThree.args.to, accountThree, "Expected address is " + accountThree);
    assert.equal(eventTokensThree.args.value.toNumber(), tokens, "Expected tokens value is " + tokens);

    //account three
    let resultGroupBuyThree = await instance.groupBuyMovie(groupId, tokens, { from: accountThree });
    let eventsGroupBuyThree = resultGroupBuyThree.logs;
    assert.isArray(eventsGroupBuyThree, 'Events is not array!');
    assert.lengthOf(eventsGroupBuyThree, 2, 'The Events array has length of 2!');

    let newQuantity = quantity - quantityGroup;
    let eventGroupBuy = eventsGroupBuyThree[0];
    assert.equal(eventGroupBuy.event, "GroupBuyMovie", "Expected GroupBuyMovie event");
    assert.equal(eventGroupBuy.args.users[0], accountThree, "Expected address is " + accountThree);
    assert.equal(eventGroupBuy.args.title, "movie title", "Expected title is movie title");
    assert.equal(eventGroupBuy.args.price.toNumber(), totalPrice, "Expected " + totalPrice +" is the total price");
    assert.equal(eventGroupBuy.args.oldQuantity.toNumber(), quantity, "Expected " + quantity +" is the old quantity");
    assert.equal(eventGroupBuy.args.newQuantity.toNumber(), newQuantity, "Expected " + newQuantity +" is the new quantity");

    let eventGroupTransferThree = eventsGroupBuyThree[1];
    assert.equal(eventGroupTransferThree.event, "TransferTo", "Expected TransferTo event");
    assert.equal(eventGroupTransferThree.args.to, account, "Expected address is " + account);
    assert.equal(eventGroupTransferThree.args.value.toNumber(), totalPrice, "Expected " + totalPrice +" is the value transfered");

    let groupArr = await instance.groups.call(groupId, { from: accountThree });
    let isFinished = groupArr[6];
    let remainingPrice = groupArr[4];
    assert.equal(isFinished, true, "Expected the group is finished");
    assert.equal(remainingPrice, 0, "Expected the remaining price is 0");

    //account two
    await expectThrow(instance.groupBuyMovie(groupId, tokens, { from: accountTwo }));
  });
})