import requester from '../data/requester.js';
import template from 'template';
import cookies from 'scripts/utils/cookies.js';
import 'jquery';
import _ from 'lodash';
import contractInstance from 'scripts/utils/init-contract.js';

const SIZE = 6;

class MovieController {
    index(page) {
        let movie;

        return new Promise((resolve, reject) => {
            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account,
                movies = [];

            instance.getMovieIds.call({"from": acc}, function(err, ids) {
                if(!err){
                    ids.forEach((movieId, index) => {
                        instance.getMovie.call(movieId, {"from": acc}, function(error, movieArr) {
                            if(!error){
                                let movie = {
                                    id: movieId,
                                    title: movieArr[0],
                                    category: movieArr[1],
                                    description: movieArr[2],
                                    imgUrl: movieArr[3],
                                    price: movieArr[4].toNumber(),
                                    quantity: movieArr[5].toNumber(),
                                    likes: movieArr[6].toNumber()
                                }

                                movies.push(movie);
                                
                                if(index == (ids.length - 1)) {
                                    let currentPage = movies.slice((page - 1) * SIZE, (page - 1) * SIZE + SIZE);
                                    let buttonsCount = Array(Math.ceil(movies.length / SIZE));

                                    for (let i = 0; i < buttonsCount.length; i += 1) {
                                        buttonsCount[i] = 1;
                                    }

                                    let obj = {
                                        movies: {
                                            movie: currentPage,
                                            size: buttonsCount,
                                            count: buttonsCount.length,
                                            hasQuery: false
                                        }
                                    };
                                    template.get('movie').then(temp => {

                                        let html = temp(obj);
                                        resolve(html);
                                    });
                                }       
                            } else {
                                alert("Something went horribly wrong. Deal with it:", error);
                            }
                        });
                    });
                } else {
                    alert("Something went horribly wrong. Deal with it:", err);
                }
            });
        });
    }

    get(movieId) {
        return new Promise((resolve, reject) => {
            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account,
                movies = [];

            instance.getMovie.call(movieId, {"from": acc}, function(error, movieArr) {
                if(!error){
                    let movie = {
                        id: movieId,
                        title: movieArr[0],
                        category: movieArr[1],
                        description: movieArr[2],
                        imgUrl: movieArr[3],
                        price: movieArr[4].toNumber(),
                        quantity: movieArr[5].toNumber(),
                        likes: movieArr[6].toNumber()
                    }
                    resolve(movie);
                         
                } else {
                    alert("Something went horribly wrong. Deal with it:", error);
                }
            });
        });
    }

    getHomeMovies() {
        return new Promise((resolve, reject) => {
            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account,
                movies = [];

            instance.getMovieIds.call({"from": acc}, function(err, ids) {
                if(!err){
                    ids.forEach((movieId, index) => {
                        instance.getMovie.call(movieId, {"from": acc}, function(error, movieArr) {
                            if(!error){
                                let movie = {
                                    id: movieId,
                                    title: movieArr[0],
                                    category: movieArr[1],
                                    description: movieArr[2],
                                    imgUrl: movieArr[3],
                                    price: movieArr[4].toNumber(),
                                    quantity: movieArr[5].toNumber(),
                                    likes: movieArr[6].toNumber()
                                }

                                movies.push(movie);
                                
                                if(index == (ids.length - 1)) {
                                    let result = {
                                        primary: movies[Math.floor(Math.random() * movies.length)],
                                        recommended_movies: _.orderBy(movies, 'likes', 'desc')
                                            .slice(0, 4)
                                            .map(movie => ({
                                                isLogged: cookies.get('user'),
                                                id: movie.id,
                                                title: movie.title,
                                                imgUrl: movie.imgUrl,
                                                price: movie.price
                                            }))
                                    };

                                    resolve(result);
                                }       
                            } else {
                                alert("Something went horribly wrong. Deal with it:", error);
                            }
                        });
                    });
                } else {
                    alert("Something went horribly wrong. Deal with it:", err);
                }
            });

        });
    }

    attachToTemplate(data, templateName) {
        return new Promise((resolve, reject) => {
            template.get(templateName).then(template => {
                let html = template(data);
                resolve(html);
            });
        });
    }

    searchBy(param, page) {
        return new Promise((resolve, reject) => {

            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account,
                movies = [];

            instance.getMovieIds.call({"from": acc}, function(err, ids) {
                if(!err){
                    ids.forEach((movieId, index) => {
                        instance.getMovie.call(movieId, {"from": acc}, function(error, movieArr) {
                            if(!error){
                                let movie = {
                                    id: movieId,
                                    title: movieArr[0],
                                    category: movieArr[1],
                                    description: movieArr[2],
                                    imgUrl: movieArr[3],
                                    price: movieArr[4].toNumber(),
                                    quantity: movieArr[5].toNumber(),
                                    likes: movieArr[6].toNumber()
                                }

                                movies.push(movie);
                                
                                if(index == (ids.length - 1)) {
                                    let paramToLower = param.toLowerCase();

                                    movies = movies.filter(
                                        b => b.title.toLowerCase().indexOf(paramToLower) > -1 ||
                                        b.category.toLowerCase().indexOf(paramToLower) > -1
                                    );
                                    let currentPage = movies.slice((page - 1) * SIZE, (page - 1) * SIZE + SIZE);
                                    let buttonsCount = Array(Math.ceil(movies.length / SIZE));
                                    for (let i = 0; i < buttonsCount.length; i += 1) {
                                        buttonsCount[i] = param;
                                    }

                                    let obj = {
                                        movies: {
                                            movie: currentPage,
                                            size: buttonsCount,
                                            hasQuery: true
                                        }
                                    };
                                    template.get('movie').then(temp => {

                                        let html = temp(obj);
                                        resolve(html);
                                    });
                                }       
                            } else {
                                alert("Something went horribly wrong. Deal with it:", error);
                            }
                        });
                    });
                } else {
                    alert("Something went horribly wrong. Deal with it:", err);
                }
            });
        });
    }

    add(context) {
        return new Promise((resolve, reject) => {
            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account;

            instance.addMovie(context.params.title, context.params.category, context.params.description, context.params.imgUrl, context.params.price, context.params.quantity, {"from": acc}, function(err, data) {
                debugger;
                if(!err){
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    edit(context) {
        return new Promise((resolve, reject) => {
            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account;

            instance.editMovie(context.params.id, context.params.title, context.params.category, context.params.description, context.params.imgUrl, context.params.price, context.params.quantity, {"from": acc}, function(err, data) {
                if(!err){
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    like(movieId) {
        return new Promise((resolve, reject) => {
            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account;

            instance.likeMovie(movieId, {"from": acc}, function(err, data) {
                if(!err){
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
}

export default MovieController;