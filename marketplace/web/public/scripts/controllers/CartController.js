import requester from '../data/requester.js';
import template from 'template';
import cookies from 'scripts/utils/cookies.js';
import popUp from '../utils/pop-up.js';
import 'jquery';

class CartController {

    clearCart() {
        $('.total').html(`$0.00`);
        $("#dropdown-cart").html('');
        localStorage.clear();
    }

    updateCartItems() {
        let currentMoviesInCart = JSON.parse(localStorage.getItem('cart'));
        let totalAmount = 0;
        if (currentMoviesInCart !== null) {
            for (let movie of currentMoviesInCart) {
                totalAmount += (+movie.price * +movie.quantity );
            }

            template.get('cart-dropdown').then(template => {
                let obj = { movie: currentMoviesInCart, amount: totalAmount };
                let html = template(obj);

                $("#dropdown-cart").html(html);
            });
        }
    }

    getCartMovies(context) {
        let currentMoviesInCart = JSON.parse(localStorage.getItem('cart')),
            totalAmount = 0;
        if (currentMoviesInCart === null) {
            currentMoviesInCart = [];
        }

        for (let movie of currentMoviesInCart) {
            totalAmount += (+movie.price * +movie.quantity );
        }

        template.get('cart').then(template => {
            let obj = { movies: currentMoviesInCart, amount: totalAmount },
                html = template(obj);

            context.swap(html);
        });
    }
}

export default CartController;