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


var server = null;

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
    server.exchange(oauth2orize.exchange.password(function(req, authInfo, accessToken, authType/*password*/, scope, done){
        var User = req.app.get('models').user;
        var Auth = req.app.get('models').auth;

        return Auth.getAccessToken(authInfo).then(function(token){
	    //토큰이 존재하는 경우 기존의 토큰을 반환한다.
            done(null,
                token.access_token,
                token.refresh_token,
                {
                    expires_in: token.expired_in,
                    //                           uid: token.user_id,
                    scope: token.scope
                }
            );
        }).catch(function(err){
            if(err.errorCode !== 404){
                log.error("oauth2#setExchange/getAccessToken expected 500", {err: err});
                return done(err);
            }
	    
            // 토큰이 존재하지 않는 경우에는 토큰을 새로 생성하고 발급한다.
            // 클라이언트 관점에서 토큰이 존재하지 않는 경우란, 처음으로 토큰을 발급하는 경우, 로그아웃 후 로그인하는 경우이다.

            var reqScope = [];
            var excScope = [];

            /* set the token's scope */
            for(var i in scope){
                if(scope[i] == 'picup_user'){
                    if(!utils.contain(reqScope, define.kind.scope.picup_user))
                        reqScope.push(define.kind.scope.picup_user);
                }
                else excScope.push(scope[i]);
            }

	    //새로운 토큰 생성/발급
            var token = tokenizer.create(define.kind.type.password, reqScope);
            return Auth.setAccessToken(authInfo, token).then(function(newToken){
                done(null,
                    newToken.access_token,
                    newToken.refresh_token,
                    {
                        expires_in: newToken.expired_in,
                        scope: newToken.scope
                    }
                );
            }).catch(function(err){
                done(err);
            });
        });
    }));

    
    server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {
        var Client = req.app.get('models').client;
        var Auth = req.app.get('models').auth;
        return Client.getAuthInfo(client.client_id, client.client_secret).then(function (authInfo) {
            return Auth.getAccessToken(authInfo).then(function (token) {
                var refreshedToken = tokenizer.refresh(token);
                return Auth.setAccessToken(authInfo, refreshedToken).then(function (refresh) {
                    return done(null, refresh.access_token, refresh.refresh_token,
                        {
                            expires_in: refresh.expires_in
                        }
                    );
                }).catch(function(err){
                    return done(err);
                });
            }).catch(function(err){
                return done(err);
            });
        }).catch(function(err){
            return done(err);
        });
    }));
};

var decision = function(){
    return [server.decision()];
};

var token = function(){
    return [
        error(),
        server.token(),
        server.errorHandler()
    ];
};

var error = function(){
    return function(err, req, res, next){
        if(err){
            server.errorHandler()(err, req, res);
        }
    };
};

exports.decision = decision;
exports.token = token;
exports.init = init;
exports.error = error;
