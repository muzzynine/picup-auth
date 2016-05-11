/**
 * Created by impyeong-gang on 1/14/16.
 */

var Promise = require('bluebird');
var AuthScheme = require('./scheme').AUTH;

var AppError = require('../lib/appError');
var config = require('../config/config');
var utils = require('../util/utils');
var Kakao = require('../lib/kakao');
var Facebook = require('../lib/facebook');
var bunyan = require('bunyan');
var log = bunyan.getLogger('DataModelLogger');


module.exports = function(connection){
    var Auth = connection.define(AuthScheme.TABLE, AuthScheme.SCHEME, AuthScheme.OPTION);

    Auth.authenticate = function(accessToken, authType){
        if(authType === config.OAUTH.TYPE.KAKAO){
	    return Kakao.getUserInfo(accessToken).then(function(info){
                return Auth.getAuthInfoByOAuthId(info.id, authType).then(function(auth){
                    return auth;
                }).catch(function(err){
                    /* 이 부분은 두가지 곳에서 두가지 목적으로 쓰인다.
                     * 하나는 모든 에러를 잡는 인증용도이고, 다른 하나는 500 에러만 잡는 용도이다.
                     * 따라서 여기서는 그대로 #findUserByOAuthId에서 발생하는 에러를 상위로 던진다.
                     * Mongo Legacy.
                     */
		    err.info = info;
		    throw err;
                });
	    });
        } else if (authType === config.OAUTH.TYPE.FACEBOOK){
            return Facebook.getUserInfo(accessToken).then(function(info){
                return Auth.getAuthInfoByOAuthId(info.id, authType).then(function(auth){
                    return auth;
                }).catch(function(err){
                    /* 이 부분은 두가지 곳에서 두가지 목적으로 쓰인다.
                     * 하나는 모든 에러를 잡는 인증용도이고, 다른 하나는 500 에러만 잡는 용도이다.
                     * 따라서 여기서는 그대로 #findUserByOAuthId에서 발생하는 에러를 상위로 던진다.
                     * Mongo Legacy.
                     */
                    err.info = info;
                    throw err;
                });
            });
        }
        else {
	    throw AppError.throwAppError(412, "Not supported 3rd party auth type");
        }
    };

    Auth.getUser = function(auth){
        return auth.getUser({
	    where : {
		isAlive : true
	    }
	}).then(function(user){
            if(!user){
                throw AppError.throwAppError(404, "Not exist user info match with auth info");
            }
            return user;
        });
    };

    Auth.getAccessToken = function(auth){
        return auth.getAccessToken({
	    where : {
		isAlive : true
	    }
	}).then(function (token) {
            if (!token) {
                throw AppError.throwAppError(404, "Not exist token");
            }
            return token;
        });
    };

    Auth.generateClientKey = function(auth){
	return auth.getClient({
	    where : {
		isAlive : true
	    }
	}).then(function(client){
	    if(client){
		return client;
	    } else {
		return auth.createClient({
		    clientId : utils.getSHA1HashString(),
		    clientSecret : utils.getSHA1HashString()
		}).then(function(client){
		    return client;
		});
	    }
	});
    };

    Auth.verifyClient = function(auth, clientId, clientSecret){
        return auth.getClient({
	    where : {
		isAlive : true
	    }
	}).then(function(client){
            if(!client){
                throw AppError.throwAppError(404, "Not exist client");
            }
            if(client.clientId === clientId && client.clientSecret === clientSecret){
                return auth;
            }
            throw AppError.throwAppError(401, "Client id, client secret authentication failed");
        });
    };

    Auth.getAuthInfoByOAuthId = function(id, authType){
        return Auth.findOne({
            where : {
                authId: id,
                authType : authType,
		isAlive : true
            }
        }).then(function(auth){
            if(!auth){
                throw AppError.throwAppError(404, "Not exist auth info");
            }
            return auth;
        });
    };

    return Auth;
};
