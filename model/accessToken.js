/**
 * Created by impyeong-gang on 1/11/16.
 */
var Promise = require('bluebird');
var AccessTokenScheme = require('./scheme').ACCESS_TOKEN;
var AppError = require('../lib/appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('DataModelLogger');

module.exports = function(connection){
    var AccessToken =  connection.define(AccessTokenScheme.TABLE, AccessTokenScheme.SCHEME, AccessTokenScheme.OPTION);

    AccessToken.findAccessTokenByValue = function(inputToken){
        return new Promise(function(resolve, reject){
            return AccessToken.findOne({
                where : {
                    accessToken : inputToken
                }
            }).then(function(token){
                if(!token){
                    throw AppError.throwAppError(404, "Not exist token");
                }
                resolve(token);
            }).catch(function(err){
		if(err.isAppError){
		    reject(err);
		} else {
		    reject(AppError.throwAppError(500, err.toString()));
		}
            });
        });
    };

    AccessToken.getAuthInfoByAccessToken = function(accessToken){
        return new Promise(function(resolve, reject){
            return AccessToken.findAccessTokenByValue(accessToken).then(function(token){
                return token.getAuth().then(function(auth){
                    if(!auth){
                        return reject(AppError.throwAppError(404));
                    }
                    resolve(auth);
                }).catch(function(err){
                    log.error("AccessToken#getAuthInfoByAccessToken/DB(RDBMS) Internal error", {err: err});
                    reject(AppError.throwAppError(500));
                });
            }).catch(function(err){
                log.error("AccessToken#getAuthInfoByAccessToken", {err: err});
                reject(err);
            });
        });
    };

    AccessToken.getUserByInstance = function(instance){
        return new Promise(function(resolve, reject){
            return instance.getAuth().then(function(authInfo){
                if(!authInfo){
                    return reject(AppError.throwAppError(404))
                }
                return authInfo.getUser().then(function(user){
                    if(!user){
                        return reject(AppError.throwAppError(404));
                    }
                    resolve(user);
                }).catch(function(err){
                    log.error("AccessToken#getUserByInstance/DB(RDBMS) Internal error", {err: err});
                    reject(AppError.throwAppError(500));
                })
            }).catch(function(err){
                log.error("AccessToken#getUserByInstance/DB(RDBMS) Internal error", {err: err});
                reject(AppError.throwAppError(500));
            });
        })
    };

    return AccessToken;
};
