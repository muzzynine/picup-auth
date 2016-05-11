'use strict';

/**
 * Created by impyeong-gang on 9/17/15.
 */
var oauth2orize = require('./oauth2orize');
var passport = require('passport');
var tokenizer = require('../util/tokenizer');
var define = require('./define');
var utils = require('../util/utils');
var config = require('../config/config');
var AppError = require('./appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('AuthenticationLogger');


var server;

var init = function(){
    if(server){
        log.info("oauth2#init/ OAuth server already running");
    }
    server = oauth2orize.createServer();
    log.info("oauth2#init/ OAuth server running now");
    setExchange(server);
};

/*
var setGrant = function(server){
    if(!server){
        throw Error();
    }
    server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done){
        var code = utils.uid(16);

        var ac = new AuthorizationCode(code, client.id, redirectURI, user.id, ares.scope);
        ac.save(function(err){
            if(err) { return done(err); }
            return done(null, code);
        });
    }));
};
*/

/* 인증정보를 토큰으로 Exchange할 로직을 등록한다. Exchange에서 반환하는 토큰은 사용자가 소유하고 Authentication/Authorization을 요구하는 요청마다 포함해야 할 토큰이다.
등록하는 Exchange는 아래와 같은 매개변수를 필요로 한다.

 @Param {Auth} accessToken과 관계있는 Auth(Model)의 인스턴스
 @Param {String} 클라이언트로부터 인증 요청받은 accessToken
 @Param {String} 인증방식을 지정한 authType

위의 정보로, authInfo와 매칭되는 accessToken이 존재하는지 검사하고,
존재하는 경우에는 존재하는 aceessToken을, 존재하지 않는 경우에는 새로 발급된 accessToken을 반환한다.
*/
var setExchange = function(server){
    if(!server){
        log.fatal("oauth2#setExchange oauth server is terminated. Cannot set exchange");
        throw Error();
    }
    //issue(req, client, username, passwd, scope, req.body, issued);
    server.exchange(oauth2orize.exchange.password(function(req, authInfo, accessToken, authType/*password*/, scope, next){
        var User = req.app.get('models').user;
        var Auth = req.app.get('models').auth;

        return Auth.getAccessToken(authInfo).then(function(token){
	    //토큰이 존재하는 경우 기존의 토큰을 반환한다.
            next(null,
                token.accessToken,
                token.refreshToken,
                {
                    expires_in: token.expiredIn,
                    //                           uid: token.user_id,
                    scope: token.scope
                }
            );
        }).catch(function(err){
	    if(!err.isAppError){
		return next(AppError.throwAppError(500, err.toString()));
	    }
	    
            if(err.errorCode !== 404){
                return next(err);
            }
	    
            // 토큰이 존재하지 않는 경우에는 토큰을 새로 생성하고 발급한다.
            // 클라이언트 관점에서 토큰이 존재하지 않는 경우란, 처음으로 토큰을 발급하는 경우, 로그아웃 후 로그인하는 경우이다.

            var reqScope = [];
            var excScope = [];
            /* set the token's scope */
            for(var i in scope){
                if(scope[i] == 'picupUser'){
                    if(!utils.contain(reqScope, define.kind.scope.picupUser))
                        reqScope.push(define.kind.scope.picupUser);
                }
                else excScope.push(scope[i]);
            }

	    //새로운 토큰 생성/발급
            var token = tokenizer.create(define.kind.type.password, reqScope);
	    return authInfo.createAccessToken({
		accessToken : token.accessToken,
                refreshToken : token.refreshToken,
                expiredIn : token.expiredIn,
                createdTime : token.createdTime
	    }).then(function(){
                next(null,
                    token.accessToken,
                    token.refreshToken,
                    {
                        expires_in: token.expiredIn,
                        scope: token.scope
                    }
                    );
	    }).catch(function(err){
		if(err.isAppError){
		    next(err);
		} else {
		    next(AppError.throwAppError(500, err.toString()));
		}
            });
        });
    }));

    
    server.exchange(oauth2orize.exchange.refreshToken(function(req, authInfo, refreshToken, scope, next) {
        var Client = req.app.get('models').client;
        var Auth = req.app.get('models').auth;
	var AccessToken = req.app.get('models').accessToken;
        Auth.getAccessToken(authInfo).then(function (token) {
	    var refresh = tokenizer.refresh(token);
	    return refresh.save().then(function(){
                return next(null, refresh.accessToken, refresh.refreshToken,
                            {
				expires_in: refresh.expiredIn
                            }
			   );
	    });
        }).catch(function(err){
	    if(err.isAppError){
		next(err);
	    } else {
		next(AppError.throwAppError(500, err.toString()));
	    }
        });
    }));
};


var token = function(){
    return [
        server.token(),
	errorHandler()
//        server.errorHandler()
    ]
};

var errorHandler = function(){
    return function(err, req, res, next){
	if(err){
	    log.error("#oauth", {err : err}, {stack : err.stack});
	    if(err.isAppError){
		res.status(err.errorCode);
		res.json(err);
	    } else {
		res.status(500);
		res.json({});
	    }
	    return;
	}
	next();
    }
}
	
		

exports.token = token;
exports.init = init;
exports.errorHandler = errorHandler;





