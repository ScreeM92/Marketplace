import 'jquery';
import 'bootstrap';
import 'lodash';
import Sammy from 'sammy';
import template from 'template';
import cookies from 'scripts/utils/cookies.js';
import popup from 'scripts/utils/pop-up.js';

/* Controllers */
import UserController from 'scripts/controllers/UserController.js';
import MovieController from 'scripts/controllers/MovieController.js';
import CartController from 'scripts/controllers/CartController.js';
import OrderController from 'scripts/controllers/OrderController.js';
import GroupController from 'scripts/controllers/GroupController.js';

/* Create controllers and sammy instances */
let userController = new UserController(),
    movieController = new MovieController(),
    cartController = new CartController(),
    orderController = new OrderController(),
    groupController = new GroupController(),
    app = new Sammy('#sammy-app');

/* movies events */
app.bind('click', function(ev) {
    if (ev.target.id === 'search-btn' ||ev.target.id === 'search-btn-icon') {
        
        let searchedQuery = $('#search-value').val();
        if (searchedQuery !== '') {
            app.setLocation(`#search/${searchedQuery}&${1}`);
        } else {
            app.setLocation(`#movies/page/1`);
        }
    }
});

app.bind('click', function(ev) {
    if (ev.target.className === 'page-link') {
        $("html, body").stop().animate({ scrollTop: 0 }, '500', 'swing', function() {});
    }
});

app.bind('click', function(ev) {
    if (ev.target.id === 'add-to-cart-btn') {
        let element = $(ev.target),
            movieId = element.attr('movie-target');

        movieController.get(movieId).then(movie => {
            let cartInfo = JSON.parse(localStorage.getItem('cart')) || [];
            let movieObj = _.find(cartInfo, {id: movieId});

            if(movieObj == null) {
                movie.quantity = 1;
                cartInfo.push(movie);
            } else {
                movieObj.quantity += 1;
            }
            
            localStorage.setItem('cart', JSON.stringify(cartInfo));

            let currentAmount = +$('.total').html().substring(1),
                newAMount = (currentAmount + movie.price).toFixed(2);

            popup.info(`"${movie.title}" is added to cart`);
            $('.total').html(`$${newAMount}`);
            localStorage.setItem('total', newAMount);
        });
    }
});

app.bind('click', function(ev) {
    if (ev.target.id === 'like-btn') {
        let element = $(ev.target),
            currentLikes = element.children('#likes').text().substr(2, 1),
            link = window.location.hash,
            slash = link.indexOf('/'),
            movieId = link.substring(slash + 1);

        movieController.like(movieId)
        .then(success => {
            if (success) {
                element.children('#likes').text(`( ${+currentLikes + 1} )`);
                popup.info(`Successfully like`);
            } else {
                popup.alert(`Unsuccessfully like`);
            }
        });
    }
});

app.bind('click', function(ev) {
    if (ev.target.id === 'buy-token-btn') {
        let wei = $('#wei-value').val();

        userController.buyTokens(wei)
        .then(success => {
            if (success) {
                popup.info(`Successfully buy tokens`);
                app.setLocation(`#movies/page/1`);
            } else {
                popup.alert(`Unsuccessfully buy tokens`);
            }
        });
    }
});

app.bind('click', function(ev) {
    if ((ev.target.id === 'edit-movie-btn' || ev.target.id === 'edit-movie-icon') && ev.target.attributes['data-id']) {
        app.setLocation(`#edit-movie/` + ev.target.attributes['data-id'].value);
    }
});

app.before({ except: { path: [] }}, context => {
    $('#header-cart').show();

    var total = localStorage.getItem('total');
    if(total && +total > 0) {
        $('.total').html(`$${+total}`);
    }

    userController.checkUserAdmin()
    .then(isAdmin => {
        let adminNavItem = $('#admin-nav-item');
        let adminMovieEdit = $('#single-movie-edit');

        if (isAdmin) {
            adminNavItem.show();
            adminMovieEdit.show();
        } else {
            adminNavItem.hide();
            adminMovieEdit.hide();
        }

        localStorage.setItem('isAdmin', isAdmin);
    });
});

app.get('#/', function(con) {
    SetActiveLink('/');
    movieController.getHomeMovies()
        .then((movies) => {
            movieController.attachToTemplate(movies, 'home')
                .then(html => {
                    con.swap(html);
                });
        });
});

app.get('#movies/page/?:page', con => {
    SetActiveLink('movies/page/1');
    let page = +con.params.page;
    movieController.index(page)
        .then(html => {
            con.swap(html);
        });
});

app.get('#movies/:id', con => {
    let movieId = con.params.id;
    movieController.get(movieId)
        .then((movie) => {
            let hasAdmin = localStorage.getItem('isAdmin');
            if(hasAdmin == "true") {
                movie.hasAdmin = true;
            }

            movieController.attachToTemplate(movie, 'single-movie')
                .then(html => {
                    con.swap(html);
                });
        });
});

app.post('#movies', context => {
    movieController.add(context).then(data => {
        if(data) {
            popup.info('The movie is added!');
            context.redirect('#movies/page/1');
        } else {
            popup.alert('Unsuccessfully added the movie!');
        }       
    });
});

app.get('#search/?:query&:page', con => {
    let query = con.params.query,
        page = +con.params.page;

    movieController.searchBy(query, page).then((html) => {
        con.swap(html);
    });
});

app.get('#groups', con => {
    SetActiveLink('groups');
    groupController.index()
        .then(html => {
            con.swap(html);
        });
});

app.get('#groups/:id', con => {
    let groupId = con.params.id;
    groupController.get(groupId)
        .then((group) => {
            movieController.attachToTemplate(group, 'single-group')
                .then(html => {
                    con.swap(html);
                });
        });
});



/* Cart */
app.get('#cart', con => {
    cartController.getCartMovies(con);
});

/* Order */
app.post('#orders', con => {
    orderController.add(con).then(data => {
        if(data) {
            popup.info('Successfully order!');
            cartController.clearCart();
            con.redirect('#movies/page/1');
        } else {
            popup.alert('Unsuccessfully order!');
        }
    });
});

app.post('#group-order', con => {
    orderController.createGroup(con).then(data => {
        if(data) {
            popup.info('Successfully group order!');
            cartController.clearCart();
            con.redirect('#movies/page/1');
        } else {
            popup.alert('Unsuccessfully group order!');
        }
    });
});

app.post('#group-buy', context => {
    orderController.groupBuy(context).then(data => {
        if(data) {
            popup.info('Successfully group buy!');
            context.redirect('#groups');
        } else {
            popup.alert('Unsuccessfully group buy!');
        }       
    });
});

/* Find us */
app.get('#find', con => {
    template.get('find').then(temp => {
        SetActiveLink('/find');

        let html = temp();
        app.swap(html);
        initMap();
    });
});

/* Buy tokens */
app.get('#tokens', con => {
    template.get('tokens').then(temp => {
        SetActiveLink('/tokens');

        let html = temp();
        app.swap(html);
    });
});

/* Admin */
app.get('#add-movie', con => {
    userController.adminAddMovie(con);
});

app.get('#withdraw', con => {
    userController.adminWithdraw(con);
});

app.post('#edit-movie', context => {
    userController.checkIsAdmin(context);

    movieController.edit(context).then(data => {
        if(data) {
            popup.info('The movie is edited!');
            context.redirect('#movies/page/1');
        } else {
            popup.alert('Unsuccessfully edited the movie!');
        }
    });
});

app.get('#edit-movie/:id', con => {
    userController.checkIsAdmin(con);

    let movieId = con.params.id;
    movieController.get(movieId)
        .then((movie) => {
            movieController.attachToTemplate(movie, 'edit-movie-dashboard')
                .then(html => {
                    con.swap(html);
                });
        });
});

app.post('#withdraw-amount', context => {
    userController.checkIsAdmin(context);

    let amount = $('#withdraw-amount').val();
    if(amount && amount > 0) {
        userController.withdrawAmount(amount).then(data => {
            if(data) {
                popup.info('Successfully withdraw ' + amount);
                context.redirect('#/');
            } else {
                popup.alert('Unsuccessfully withdraw ' + amount);
            }
        });
    }    
});

app.post('#withdraw', context => {
    userController.checkIsAdmin(context);

    userController.withdraw().then(data => {
        if(data) {
            popup.info('Successfully withdraw the contract balance');
            context.redirect('#/');
        } else {
            popup.alert('Unsuccessfully withdraw the contract balance');
        }
    }); 
});


/* Events */
$(document).ready(function() {
    /* Cart items update */
    $('#cart-btn').on('mouseenter', function() {
        cartController.updateCartItems();
    });

    $('#cart-btn').on('mouseover', function() {
        $("#dropdown-cart").css('display', 'block');
    });

    $('#cart-btn').on('mouseout', function() {
        $("#dropdown-cart").css('display', 'none');
    });

    let nav = $('#main-nav');

    nav.on('click', 'a', ev => {
        let element = $(ev.target);

        nav.find('a').removeClass('active');
        element.addClass('active');
    });

    $(document).on('click','#delete-movie',function(){
       let element = $(this),
            movieId = element.attr('data-id');
            
        let cartInfo = JSON.parse(localStorage.getItem('cart')) || [];
        let movie = _.find(cartInfo, { id: movieId });
        var total = +localStorage.getItem('total');

        total -= (+movie.price * +movie.quantity);
        $('.total').html(`$${total}`);
        localStorage.setItem('total', total);

        cartInfo = _.filter(cartInfo, function (f) { return f.id !== movieId; });
        localStorage.setItem('cart', JSON.stringify(cartInfo));

        cartController.updateCartItems();
        popup.info(`"${movie.title}" is remove from the cart`);
    });

    app.run('#/');
});

function SetActiveLink(name) {
    let nav = $('#main-nav');
    nav.find('a').removeClass('active');

    nav.find('a[href="#' + name + '"]').addClass('active');
}

function initMap() {
    let locationSoftuni = { lat: 42.666786, lng: 23.352277 },
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: locationSoftuni
        }),
        marker = new google.maps.Marker({
            position: locationSoftuni,
            map: map
        });
}