var Marketplace = artifacts.require("./Marketplace.sol");
var MoviesLib = artifacts.require("./MoviesLib.sol");
var SafeMath = artifacts.require("./SafeMath.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, [MoviesLib, Marketplace]);
  deployer.deploy(MoviesLib);
  deployer.link(MoviesLib, Marketplace);
  deployer.deploy(Marketplace);
};