'use strict';

/**
 * Created by impyeong-gang on 9/17/15.
 */
var passport = require('passport');
var ResourceOwnerPasswordStrategy = require('passport-oauth2-resource-owner-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var define = require('./define');

var User = require('../model/user');
var AccessToken = require('../model/accessToken');
var AppError = require('./appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('AuthenticationLogger');
var tokenizer = require('../util/tokenizer');


/* OAuth2.0의 인증 방식별 로직을 세팅한다. */
var setPassportStrategy = function(){
    passport.use(new BearerStrategy({
        passReqToCallback: true
    }, function(req, accessToken, next){
	var AccessToken = req.app.get('models').accessToken;
	var Session = req.app.get('session');

	AccessToken.findAccessTokenByValue(accessToken).then(function(token){
            if(!tokenizer.validate(token)){
		throw AppError.throwAppError(403, "Invalid Token");
            }
	    return token.getAuth({
		where : {
		    isAlive : true
		}
	    }).then(function(authInfo){
		if(!authInfo){
		    throw AppError.throwAppError(404, "Not exist authInfo");
		}
		if(authInfo.isBan){
		    throw AppError.throwAppError(401, "Ban user");
		}
		return authInfo.getUser({
		    where : {
			isAlive : true
		    }
		}).then(function(user){
		    if(!user){
			throw AppError.throwAppError(404, "Not exist user");
		    }
		    return {
			id : user.id,
			nickname : user.nickname,
			profilePath : user.profilePath,
			latestReqDate : user.latestReqDate,
			countAddPhoto : user.countAddPhoto,
			countDeletedPhoto : user.countDeletedPhoto,
			usageStorage : user.usageStorage,
			isAlive : user.isAlive,
			createdAt : user.createdAt,
			updatedAt : user.updatedAt,
			deletedAt : user.deletedAt
		    };
		});
	    });
	}).then(function(user){
	    next(null, user);
	}).catch(function(err){
	    if(err.isAppError){
		next(err);
	    } else {
		next(AppError.throwAppError(500, err.toString()));
	    }
	});
    }));



    /* OAuth2.0 인증 방식인 ResourceOwnerPassword의 로직을
     * 등록한다. 아래와 같은 매개변수를 받아 클라이언트가 유효한
     * 클라이언트인지를 확인한다.

       @Param {String} client_id - 클라이언트에게 발급된 인증용 identifier
       @Param {String} client_secert - client_id와 매치되는 secret string
       @Param {String} accessToken - 3rd party service의 accessToken
       @Param {String} authType - 3rd party app name

       위의 매개변수를 통해 3rd party service의 유효한 인증 정보인지
       확인하고, 클라이언트에게 발급된 client_id, client_secret이
       유효한지 확인한다. */
    
    passport.use(new ResourceOwnerPasswordStrategy({
        passReqToCallback: true
    }, function(req, client_id, client_secret, accessToken, authType, next) {
        var Auth = req.app.get('models').auth;
        var grant_type = req.body.grant_type;
	
        if (!grant_type) {
            return next(AppError.throwAppError(400, "Require grant_type argument"));
        }
        switch (grant_type) {
        case define.kind.type.password.name:
            break;
	case define.kind.type.refreshToken.name:
	    break;
        default:
            return next(AppError.throwAppError(400, "Not supported grant type"));
        }

        Auth.authenticate(accessToken, authType).then(function(authInfo) {
            return Auth.verifyClient(authInfo, client_id, client_secret).then(function () {
                next(null, authInfo, {});
            });
        }).catch(function(err){
            //kakao, facebook 잘못된 요청 400
            //authInfo가 존재하지 않을 경우(가입이 안되었지만 토큰 발급 요청이 오는 경우) 404
            //서버 에러 500
	    if(err.isAppError){
		next(err);
	    } else {
		next(AppError.throwAppError(500, err.toString()));
	    }
        });
    }));
};

exports.setPassportStrategy = setPassportStrategy;
