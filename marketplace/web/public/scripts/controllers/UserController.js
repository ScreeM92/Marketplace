import requester from '../data/requester.js';
import popUp from '../utils/pop-up.js';
import template from 'template';
import CartController from './CartController.js';
import 'jquery';
import contractInstance from 'scripts/utils/init-contract.js';

let cartController = new CartController();

class UserController {

    adminAddMovie(context) {
        this.checkIsAdmin(context);

        template.get('add-movie-dashboard')
            .then(template => {
                let html = template();
                context.swap(html);
            });
    }

    adminOrders(context) {
        this.checkIsAdmin(context);

        template.get('orders')
            .then(template => {
                let html = template();
                context.swap(html);
            });
    }

    adminWithdraw(context) {
        this.checkIsAdmin(context);

        template.get('withdraw')
            .then(template => {
                let html = template();
                context.swap(html);
            });
    }

    withdrawAmount(amount) {
        return new Promise((resolve, reject) => {
            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account;
            
            instance.withdrawAmount(amount, {"from": acc}, function(error, data) {
                if(!error){
                    resolve(true);  
                } else {
                    resolve(false); 
                }
            });
        });
    }

    withdraw() {
        return new Promise((resolve, reject) => {
            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account;

            instance.withdraw({"from": acc}, function(error, owner) {
                if(!error){
                    resolve(true);  
                } else {
                    resolve(false);
                }
            });
        });
    }

    checkUserAdmin() {
        return new Promise((resolve, reject) => {
            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account;

            instance.owner.call({"from": acc}, function(error, owner) {
                if(!error){
                    resolve(owner === acc);  
                } else {
                    alert("Something went horribly wrong. Deal with it:", error);
                }
            });
        });
    }

    buyTokens(wei) {
        return new Promise((resolve, reject) => {
            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account;

            instance.buyTokens({"from": acc, "value": wei}, function(error, data) {
                if(!error){
                    resolve(true);  
                } else {
                    resolve(false); 
                }
            });
        });
    }

    checkIsAdmin(context) {
        if (localStorage.getItem('isAdmin') == 'false') {
            popUp.alert('Admin only!');
            context.redirect('#/');
            return;
        }
    }

    showUserMenu() {
        $('#menu-user-login').hide();
        $('#menu-user-register').hide();
        $('#menu-user-logout').show();
        $('#header-cart').show();
    }
}

export default UserController;