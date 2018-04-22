let cookies = {
    get(name) {
        let allCookiesArray = document.cookie.split(/;\s*/).map(s => {
                return s.split('=');
            }),
            allCookiesObject = {};

        allCookiesArray.forEach(x => { allCookiesObject[x[0]] = x[1] });

        if (name) {
            return allCookiesObject[name];
        }
        return allCookiesObject;

    }
};

export default cookies;