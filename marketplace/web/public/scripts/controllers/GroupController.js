import requester from '../data/requester.js';
import template from 'template';
import cookies from 'scripts/utils/cookies.js';
import 'jquery';
import _ from 'lodash';
import contractInstance from 'scripts/utils/init-contract.js';

class GroupController {
    index(page) {
        let group;

        return new Promise((resolve, reject) => {
            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account,
                groups = [];

            instance.getGroupIds.call({"from": acc}, function(err, ids) {
                if(!err){
                    ids.forEach((groupId, index) => {
                        instance.groups.call(groupId, {"from": acc}, function(error, groupArr) {
                            if(!error) {
                                let groupId = groupArr[0],
                                    movieId = groupArr[1],
                                    totalPrice = groupArr[2].toNumber(),
                                    quantity = groupArr[3].toNumber(),
                                    remainingPrice = groupArr[4].toNumber(),
                                    finished = groupArr[6];

                                instance.getMovie.call(movieId, {"from": acc}, function(error, movieArr) {
                                    let group = {
                                        id: groupId,
                                        quantity: quantity,
                                        totalPrice: totalPrice,
                                        remainingPrice: remainingPrice,
                                        finished: finished,
                                        movie: {
                                            title: movieArr[0],
                                            imgUrl: movieArr[3],
                                            price: movieArr[4].toNumber()
                                        }
                                    }

                                    groups.push(group);
                                    
                                    if(index == (ids.length - 1)) {
                                        let obj = {
                                            groups: groups
                                        };
                                        template.get('groups').then(temp => {
                                            let html = temp(obj);
                                            resolve(html);
                                        });
                                    }       
                                });
                            } 
                            else {
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

    get(groupId) {
        return new Promise((resolve, reject) => {
            let contract = contractInstance.get(),
                instance = contract.instance,
                acc = contract.account;

            instance.groups.call(groupId, {"from": acc}, function(error, groupArr) {
                if(!error) {
                    let groupId = groupArr[0],
                        movieId = groupArr[1],
                        totalPrice = groupArr[2].toNumber(),
                        quantity = groupArr[3].toNumber(),
                        remainingPrice = groupArr[4].toNumber(),
                        finished = groupArr[6];

                    instance.getMovie.call(movieId, {"from": acc}, function(error, movieArr) {
                        let group = {
                            id: groupId,
                            quantity: quantity,
                            totalPrice: totalPrice,
                            remainingPrice: remainingPrice,
                            finished: finished,
                            movie: {
                                title: movieArr[0],
                                imgUrl: movieArr[3],
                                price: movieArr[4].toNumber()
                            }
                        }

                        resolve(group);      
                    });
                } 
                else {
                    alert("Something went horribly wrong. Deal with it:", error);
                }
            });
        });
    }
}

export default GroupController;