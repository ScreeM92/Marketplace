import requester from '../data/requester.js';
import template from 'template';
import cookies from 'scripts/utils/cookies.js';
import popUp from '../utils/pop-up.js';
import contractInstance from 'scripts/utils/init-contract.js';
import 'jquery';

class OrderController {

    add(context) {
        return new Promise((resolve, reject) => {
            let currentMoviesInCart = JSON.parse(localStorage.getItem('cart'));
            if (currentMoviesInCart === null) {
                currentMoviesInCart = [];
            }

            if (currentMoviesInCart.length == 0) {
                popUp.alert('No added movies!')
                return;
            }

            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account,
                isSuccesfulBuy = false;
            
            currentMoviesInCart.forEach((movie, index) => {
                // let value = (+movie.quantity * +movie.price);
                instance.buyMovie(movie.id, movie.quantity, {"from": acc }, function(err, data) {
                    if(!err) {
                        popUp.info('Successfully buy ' + movie.title);
                        isSuccesfulBuy = true;
                    } else {
                        popUp.alert('Unsuccessfully buy ' + movie.title);
                    } 
                    
                    if(index == (currentMoviesInCart.length - 1)) {
                        resolve(isSuccesfulBuy);
                    }
                });
            });
        });
    }

    createGroup(context) {
        return new Promise((resolve, reject) => {
            let currentMoviesInCart = JSON.parse(localStorage.getItem('cart'));
            if (currentMoviesInCart === null) {
                currentMoviesInCart = [];
            }

            if (currentMoviesInCart.length == 0) {
                popUp.alert('No added movies!')
                return;
            }

            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account,
                isSuccesfulGroupBuy = false;
            
            currentMoviesInCart.forEach((movie, index) => {
                instance.createGroupBuyMovie(movie.id, movie.quantity, {"from": acc }, function(err, data) {
                    if(!err) {
                        popUp.info('Successfully create group for buying ' + movie.title);
                        isSuccesfulGroupBuy = true;
                    } else {
                        popUp.alert('Unsuccessfully create group for buying ' + movie.title);
                    } 
                    
                    if(index == (currentMoviesInCart.length - 1)) {
                        resolve(isSuccesfulGroupBuy);
                    }
                });
            });
        });
    }

    groupBuy(context) {
        return new Promise((resolve, reject) => {
            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account;

            instance.groupBuyMovie(context.params.group_id, context.params.tokens, {"from": acc}, function(err, data) {
                if(!err){
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
}

export default OrderController;