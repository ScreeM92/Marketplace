var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));

var acc = web3.eth.accounts[0]; //get the first account

//Store this contract's compiled bytecode and ABI
// Library address - 345ca3e014aaf5dca488057592ee47305d9b3e10
var abi = [{"constant":false,"inputs":[{"name":"self","type":"MoviesLib.Movie storage"}],"name":"like","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"title","type":"string"},{"indexed":false,"name":"price","type":"uint256"},{"indexed":false,"name":"quantity","type":"uint256"}],"name":"AddMovie","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"title","type":"string"},{"indexed":false,"name":"price","type":"uint256"},{"indexed":false,"name":"quantity","type":"uint256"}],"name":"EditMovie","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"buyer","type":"address"},{"indexed":false,"name":"_title","type":"string"},{"indexed":false,"name":"_price","type":"uint256"},{"indexed":false,"name":"_oldQuantity","type":"uint256"},{"indexed":false,"name":"_newQuantity","type":"uint256"}],"name":"BuyMovie","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"_title","type":"string"},{"indexed":false,"name":"likes","type":"uint256"}],"name":"LikeMovie","type":"event"}];
var bytecode = "61021d610030600b82828239805160001a6073146000811461002057610022565bfe5b5030600052607381538281f3007300000000000000000000000000000000000000003014606060405260043610610058576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680631fd9976b1461005d575b600080fd5b811561006857600080fd5b61007e6004808035906020019091905050610080565b005b60018160090160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055506100e9816007015460016101d3565b81600701819055503373ffffffffffffffffffffffffffffffffffffffff167f77e48626401ba85a69f2da085de31925a2387f4a9e86351e6f10c6f6266ff74182600101836007015460405180806020018381526020018281038252848181546001816001161561010002031660029004815260200191508054600181600116156101000203166002900480156101c15780601f10610196576101008083540402835291602001916101c1565b820191906000526020600020905b8154815290600101906020018083116101a457829003601f168201915b5050935050505060405180910390a250565b60008082840190508381101515156101e757fe5b80915050929150505600a165627a7a72305820f8b041ee29024e5de493782c818ab57fb4f2b2807447b874897afcec8f6cacb10029";

//create the contract instance. We can use this instance to publish or connect to a published contract
var Contract = web3.eth.contract(abi);

//create a JS Object (key-value pairs), holding the data we need to publish our contract
var publishData = {
	"from": acc, //the account from which it will be published
	"data": bytecode,
	"gas": 4700000 //gas limit. This should be the same or lower than Ethereum's gas limit
}

//publish the contract, passing a callback that will be called twice. Once when the transaction is sent, and once when it is mined
//the first argument is the constructor argument
Contract.new(publishData, function(err, contractInstance) {
	if(!err) {
		if(contractInstance.address) { //if the contract has an address aka if the transaction is mined
			console.log("New library address is :", contractInstance.address);
		}
	} else {
		console.error(err); //something went wrong
	}
});
