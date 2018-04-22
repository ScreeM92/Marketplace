SystemJS.config({
    'transpiler': 'plugin-babel',
    'map': {
        'plugin-babel': './node_modules/systemjs-plugin-babel/plugin-babel.js',
        'systemjs-babel-build': './node_modules/systemjs-plugin-babel/systemjs-babel-browser.js',
        'app': './scripts/app.js',
        'data': './scripts/data.js',
        'jquery': './bower_components/jquery/dist/jquery.min.js',
        'lodash': './bower_components/lodash/dist/lodash.min.js',
        'tether': './bower_components/tether/dist/js/tether.min.js',
        'bootstrap': './bower_components/bootstrap/dist/js/bootstrap.min.js',
        'sammy': './bower_components/sammy/lib/min/sammy-latest.min.js',
        'handlebars': './bower_components/handlebars/handlebars.min.js',
        'template': './scripts/data/handlebars-template.js',
        'requester': './scripts/data/requester.js',
    },
    'meta': {
        'bootstrap': {
            globals: {
                Tether: 'tether'
            }
        }
    }
});