import "jquery";

var contractInstance,
    abi = [{"constant":true,"inputs":[{"name":"_id","type":"bytes32"}],"name":"getMovie","outputs":[{"name":"title","type":"string"},{"name":"category","type":"string"},{"name":"description","type":"string"},{"name":"imgUrl","type":"string"},{"name":"price","type":"uint256"},{"name":"quantity","type":"uint256"},{"name":"likes","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_amount","type":"uint256"}],"name":"withdrawAmount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"bytes32"}],"name":"likeMovie","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"bytes32"},{"name":"_quantity","type":"uint256"}],"name":"getMoviePrice","outputs":[{"name":"price","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"bytes32"},{"name":"_quantity","type":"uint256"}],"name":"buyMovie","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"userGroups","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_title","type":"string"},{"name":"_category","type":"string"},{"name":"_description","type":"string"},{"name":"_imgUrl","type":"string"},{"name":"_price","type":"uint256"},{"name":"_quantity","type":"uint256"}],"name":"addMovie","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"bytes32"},{"name":"_title","type":"string"},{"name":"_category","type":"string"},{"name":"_description","type":"string"},{"name":"_imgUrl","type":"string"},{"name":"_price","type":"uint256"},{"name":"_quantity","type":"uint256"}],"name":"editMovie","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMovieIds","outputs":[{"name":"","type":"bytes32[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getGroupIds","outputs":[{"name":"","type":"bytes32[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"buyTokens","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_movieId","type":"bytes32"},{"name":"_quantity","type":"uint256"}],"name":"createGroupBuyMovie","outputs":[{"name":"buyMovieGroupId","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_groupId","type":"bytes32"},{"name":"_tokens","type":"uint256"}],"name":"groupBuyMovie","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"groups","outputs":[{"name":"groupId","type":"bytes32"},{"name":"movieId","type":"bytes32"},{"name":"totalPrice","type":"uint256"},{"name":"quantity","type":"uint256"},{"name":"remainingPrice","type":"uint256"},{"name":"available","type":"bool"},{"name":"finished","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"amountWithdrawn","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"creator","type":"address"},{"indexed":false,"name":"movieId","type":"bytes32"},{"indexed":false,"name":"quantity","type":"uint256"},{"indexed":false,"name":"price","type":"uint256"}],"name":"CreateGroup","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"TransferTo","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}],
    address = "0xf12b5dd4ead5f743c6baa640b0216200e89b60da",
    acc;

if (typeof web3 === 'undefined') {
    //if there is no web3 variable
    alert("Error! Are you sure that you are using metamask?");
} else {
    init();
}

function init(){
    var Contract = web3.eth.contract(abi);
    contractInstance = Contract.at(address);
    updateAccount();
}

function updateAccount(){
    //in metamask, the accounts array is of size 1 and only contains the currently selected account. 
    //The user can select a different account and so we need to update our account variable
    acc = web3.eth.accounts[0];
}

let contract = {
    get() {
        updateAccount();
        return {
            instance: contractInstance,
            account: acc
        }

    }
};

export default contract;