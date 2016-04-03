/**
 * Created by impyeong-gang on 12/7/15.
 */
/**
 * Created by impyeong-gang on 12/7/15.
 */
var express = require('express');
var bodyParser = require('body-parser');
<<<<<<< Updated upstream
var config = require('./config');
var logger = require('morgan');
=======
var config = require('./config/config');
>>>>>>> Stashed changes
var passport = require('passport');
var logging = require('./lib/logger');
var bunyan = require('bunyan');
var log = bunyan.getLogger('MainLogger');


var oauth = require('./lib/oauth2');
var auth = require('./lib/auth');

var app = express();

app.set('models', require('./model'));

<<<<<<< Updated upstream
app.use(logger('dev'));
=======
if(process.env.NODE_ENV == 'development'){
    console.log("Server running Development Mode");
    app.use(require('morgan')('dev'));
} else if(process.env.NODE_ENV == 'production'){
    console.log("Server running Production Mode");
}

>>>>>>> Stashed changes
app.disable('etag');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.use(passport.initialize());
app.use(passport.session());
//auth.setSession(app);

auth.setPassportStrategy();
oauth.init();

var membershipRouter = require('./router/membershipRouter');
var oauthRouter = require('./router/oauthRouter');
var verifyRouter = require('./router/verifyRouter');

app.use('/membership', membershipRouter);
app.use('/oauth', oauthRouter);
app.use('/verify', verifyRouter);

log.info("Picup Auth server ready");
app.listen(8110);
