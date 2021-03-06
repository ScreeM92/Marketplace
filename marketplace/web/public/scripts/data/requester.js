import 'jquery';

let requester = {
    get(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                    url,
                    contentType: 'application/json',
                    method: 'GET'
                })
                .done(resolve)
                .fail(reject);
        });
    },

    post(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                    url,
                    contentType: 'application/json',
                    method: 'POST',
                    data: JSON.stringify(data)
                })
                .done(resolve)
                .fail(err => {
                    reject(err);
                });
        });
    },
    put(url, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                    url,
                    contentType: 'application/json',
                    method: 'PUT',
                    data: JSON.stringify(data)
                })
                .done(resolve)
                .fail(reject);
        });
    }
};

export default requester;