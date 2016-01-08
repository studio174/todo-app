/* 
 * express server application
 */

/* require express web framework */
var express = require('express'),

    /* require core node module for paths this helps with different platforms (mac, linux, windoes) */
    path = require('path'),

    /* used for locating and serving a favicon.ico */
    favicon = require('serve-favicon'),

    /* middleware for logging http requests */
    logger = require('morgan'),

    /* to parse cookie headers */
    cookieParser = require('cookie-parser'),

    /* no longer part of the express core, used to parse the request body to interface with */
    bodyParser = require('body-parser'),

    /* 
     * using passports local strategy for authentication
     * - possibly going to add Oauth for social auth
     */
    passport = require('passport'),
    localStrategy = require('passport-local').Strategy,

    /* require our user schema for authentication */
    User = require('./models/user.js'),

    /*  
     * Note: 
     * ----------------------------------------------------------------------
     * I prefer to separate a lot of configuration into separate files
     * for the purpose of reusing code, maintainability when colaborating
     * for example: app = require('./app-config')(express()),
     * this has proven to be useful in situations where I'm asked to build out two nearly identical websites
     * except each website is branded differently (different path to logo, different phone numbers, etc).
     * In the config file I'll create a javascript version of an associative array that stores a key/value
     * where the key is either a app var or path to a route and the value is the require method or value of said var 
     * ie:
     * var appSettings = { settings: [{key: 'appVersion', val: pkg.version }], routes: [{ key: '/', value: require('/routes/index.js') }] }; 
     * appSettings.settings.forEach(function(setting) { 
     *     app.set(setting.key, setting.val); 
     * });
     * appSettings.routes.forEach(function(route) {
     *  app.use(route.key, route.val);
     * });
     * this helps when developing one site and then merging the updates into the other site
     */
    app = express();


/* require database connection every time the server boots */
require('./lib/connection');

/* view engine setup */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


/* 
 * define middleware
 */
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'chocolate rain',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

/* configure express to serve bower components when developing */
app.use('/bower_components', express.static(__dirname + '/bower_components'));

/* configure passport */
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


/* 
 * application routes 
 */
app.use('/', require('./routes/index'));

/* create our user noun */
app.use('/user/', require('./routes/api.js'));

/* used for serving up jade partials */
app.get('/partial/:name', function(req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
});


/* 
 * error handling generated by express generator
 */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
