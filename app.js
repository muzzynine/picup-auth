/**
 * Created by impyeong-gang on 12/7/15.
 */
/**
 * Created by impyeong-gang on 12/7/15.
 */
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config/config');
var passport = require('passport');
var logging = require('./lib/logger');
var bunyan = require('bunyan');
var log = bunyan.getLogger('MainLogger');
//var SessionStore = require('./lib/session');
var Promise = require('bluebird');

var oauth = require('./lib/oauth2');
var auth = require('./lib/auth');

var app = express();

app.set('models', require('./model'));
//session setup
//app.set('session', new SessionStore(config.SESSION));

if(process.env.NODE_ENV == 'development'){
    log.info("Server running Development Mode");
    app.use(require('morgan')('dev'));

    //Sequelize query log printed std out
    Promise.config({
	warnings : true
    });

} else if(process.env.NODE_ENV == 'production'){
    log.info("Server running Production Mode");
    process.on('uncaughtException', function(err){
	log.fatal("UncaughtExceptionEmit", {err : err.toString()}, {stack : err.stack});
    });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.use(passport.initialize());
//app.use(passport.session());

auth.setPassportStrategy();
oauth.init();


app.get('/health', function(req, res, next){
    res.status(200);
    res.json({});
    return;
});


var membershipRouter = require('./router/membershipRouter');
var oauthRouter = require('./router/oauthRouter');
var verifyRouter = require('./router/verifyRouter');

app.use('/membership', membershipRouter);
app.use('/oauth', oauthRouter);
app.use('/verify', verifyRouter);

log.info("Picup Auth server ready");
app.listen(8110);
