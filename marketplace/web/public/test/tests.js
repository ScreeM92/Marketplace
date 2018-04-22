import MovieController from '../scripts/controllers/movieController.js';
import requester from 'requester';
import template from 'template';

mocha.setup('bdd');

const { expect, assert } = chai;

describe('Movie shelf tests', function() {
    describe('MovieController tests', function() {
        const result = [],
            page = 1,
            param = 'Action';

        let movieController = new MovieController();

        beforeEach(function() {
            sinon.stub(requester, 'get')
                .returns(new Promise((resolve, reject) => {
                    resolve(result);
                }));
            sinon.stub(requester, 'post')
                .returns(new Promise((resolve, reject) => {
                    resolve(result);
                }));
        });
        afterEach(function() {
            requester.get.restore();
            requester.post.restore();
        });

        it('expect movieController.index() to make exactly two get call', function(done) {
            movieController.index()
                .then(() => {
                    expect(requester.get.calledTwice).to.be.true;
                })
                .then(done, done);
        });
        it('expect movieController.index() to make correct get second call', function(done) {
            movieController.index()
                .then(() => {
                    const actual = requester.get
                        .secondCall
                        .args[0];

                    expect(actual).to.equal('/movies');
                })
                .then(done, done);
        });
        it('expect movieController.index() to return correct result', function(done) {
            Promise.resolve(template.get('movie')).then(templ => {
                    return templ({});
                })
                .then((templ) => {
                    movieController.index()
                        .then((obj) => {
                            expect(obj).to.eql(templ);
                        })
                        .then(done, done);
                });
        });
        it('expect movieController.get() to make exactly one get call', function(done) {
            movieController.get(123)
                .then(() => {
                    expect(requester.get.calledOnce).to.be.true;
                })
                .then(done, done);
        });
        it('expect movieController.get() to make correct get first call', function(done) {
            let id = 123;
            movieController.get(id)
                .then(() => {
                    const actual = requester.get
                        .firstCall
                        .args[0];

                    expect(actual).to.equal('/movies/' + id);
                })
                .then(done, done);
        });
        it('expect movieController.attachToTemplate() to return correct result', function(done) {
            Promise.resolve(template.get('movie')).then(templ => {
                    return templ({});
                })
                .then((templ) => {
                    movieController.attachToTemplate({}, 'movie')
                        .then((obj) => {
                            expect(obj).to.eql(templ);
                        })
                        .then(done, done);
                });
        });
        it('expect movieController.searchBy() to make exactly two get call', function(done) {
            movieController.searchBy(param, page)
                .then(() => {
                    expect(requester.get.calledTwice).to.be.true;
                })
                .then(done, done);
        });
        it('expect movieController.searchBy() to make correct get second call', function(done) {
            movieController.searchBy(param, page)
                .then(() => {
                    const actual = requester.get
                        .secondCall
                        .args[0];

                    expect(actual).to.equal('/movies');
                })
                .then(done, done);
        });
        it('expect movieController.add() to make exactly one post call', function() {
            let context = {
                params: {
                    price: 12
                }
            };

            movieController.add(context);
            expect(requester.post.calledOnce).to.be.true;
        });
        it('expect movieController.edit() to make exactly one post call', function() {
            sinon.stub(requester, 'put')
                .returns(new Promise((resolve, reject) => {
                    resolve(result);
                }));
            movieController.edit().increaseLikes(12, 12);
            expect(requester.put.calledOnce).to.be.true;

            requester.put.restore();
        });
        it('expect movieController.updateCartItems() to call template.get exactly once', function() {
            sinon.stub(template, 'get')
                .returns(new Promise((resolve, reject) => {
                    resolve(function() {});
                }));
            sessionStorage.setItem('cart', JSON.stringify([]));

            movieController.updateCartItems();
            expect(template.get.calledOnce).to.be.true;

            sessionStorage.clear();
            template.get.restore();
        });
        it('expect movieController.updateCartItems() to not call template.get', function() {
            sinon.stub(template, 'get')
                .returns(new Promise((resolve, reject) => {
                    resolve(result);
                }));

            movieController.updateCartItems();
            expect(template.get.calledOnce).to.be.false;

            template.get.restore();
        });
    });
});


mocha.run();