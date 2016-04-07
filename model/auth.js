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
    var Auth = connection.define(AuthScheme.TABLE, AuthScheme.SCHEME);

    Auth.authenticate = function(accessToken, authType){
	return new Promise(function(resolve, reject){
            if(authType === config.OAUTH.TYPE.KAKAO){
		return Kakao.getUserInfo(accessToken).then(function(info){
                    return Auth.getAuthInfoByOAuthId(info.id, authType).then(function(auth){
                       resolve(auth, info);
                    }).catch(function(err){
                       /* 이 부분은 두가지 곳에서 두가지 목적으로 쓰인다.
                       * 하나는 모든 에러를 잡는 인증용도이고, 다른 하나는 500 에러만 잡는 용도이다.
                       * 따라서 여기서는 그대로 #findUserByOAuthId에서 발생하는 에러를 상위로 던진다.
                       * Mongo Legacy.
                       */
			err.info = info;
			throw err;
                   });
		}).catch(function(err){
		    if(err.isAppError){
			return reject(err);
		    }
		    reject(AppError.throwAppError(500, err.toString()));
               });
           } else if (authType === config.OAUTH.TYPE.FACEBOOK){
               return Facebook.getUserInfo(accessToken).then(function(info){
                   return Auth.getAuthInfoByOAuthId(info.id, authType).then(function(auth){
                       resolve(auth, info);
                   }).catch(function(err){
                       /* 이 부분은 두가지 곳에서 두가지 목적으로 쓰인다.
                        * 하나는 모든 에러를 잡는 인증용도이고, 다른 하나는 500 에러만 잡는 용도이다.
                        * 따라서 여기서는 그대로 #findUserByOAuthId에서 발생하는 에러를 상위로 던진다.
                        * Mongo Legacy.
                        */
                       err.info = info;
                       throw err;
                   });
               }).catch(function(err){
		   if(err.isAppError){
		       return reject(err);
		   }
		   reject(AppError.throwAppError(500, err.toString()));

               });
           }
            else {
		reject(AppError.throwAppError(412, "Not supported 3rd party auth type"));
           }
       })
    };

    Auth.getUser = function(auth){
        return new Promise(function(resolve, reject){
            auth.getUser().then(function(user){
                if(!user){
                    throw AppError.throwAppError(404, "Not exist user info match with auth info");
                }
                resolve(user);
            }).catch(function(err){
		if(err.isAppError){
		    return reject(err);
		}
		reject(AppError.throwAppError(500, err.toString()));
            });
        });
    };

    Auth.getAccessToken = function(auth){
        return new Promise(function(resolve, reject){
            return auth.getAccessToken().then(function (token) {
                if (!token) {
                    return reject(AppError.throwAppError(404));
                }
                resolve(token);
            }).catch(function(err){
                log.error("Auth#getAccessToken/DB(RDBMS) Internal error", {err: err});
                reject(AppError.throwAppError(500));
            })
        })
    };

    Auth.addBan = function(auth, ban){
	return new Promise(function(resolve, reject){
	    if(auth.isBan){
		throw AppError.throwAppError(400, "already banned user");
	    }
	    auth.addBanInfo(ban).then(function(){
		auth.isBan = true;
		return auth.save().then(function(){
		    resolve();
		});
	    }).catch(function(err){
		reject(AppError.throwAppError(500, err.toString()))
	    });
	});
    };
		      
		    

    Auth.setAccessToken = function(auth, token){
        return new Promise(function(resolve, reject){
            return auth.createAccessToken({
                access_token : token.access_token,
                refresh_token : token.refresh_token,
                expired_in : token.expired_in,
                created_time : token.created_time
            }).then(function(){
                resolve(token);
            }).catch(function(err){
                log.error("Auth#setAccessToken/DB(RDBMS) Internal error", {err: err});
                reject(AppError.throwAppError(500));
            })
        })
    };


    Auth.generateClientKey = function(auth){
        return new Promise(function(resolve, reject){
	    auth.getClient().then(function(client){
		if(client){
		    resolve({
			id : client.client_id,
			secret : client.client_secret
		    });
		} else {
		    var newClient = {
			id : utils.getSHA1HashString(),
			secret : utils.getSHA1HashString()
		    };
		    return auth.createClient({
			client_id : newClient.id,
			client_secret : newClient.secret
		    }).then(function(){
			resolve(newClient);
		    });
		}
	    }).catch(function(err){
		if(err.isAppError){
		    return reject(err);
		}
		reject(AppError.throwAppError(500, err.toString()));
            });
        })
    };

    Auth.verifyClient = function(auth, clientId, clientSecret){
        return new Promise(function(resolve, reject){
            return auth.getClient().then(function(client){
                if(!client){
                    return reject(AppError.throwAppError(404));
                }
                if(client.client_id === clientId && client.client_secret === clientSecret){
                    return resolve(auth);
                }
                reject(AppError.throwAppError(403));
            }).catch(function(err){
                log.error("Auth#verify/DB(RDBMS) Internal error", {err: err});
                reject(AppError.throwAppError(500));
            });
        })
    };

    Auth.getAuthInfoByOAuthId = function(id, authType){
        return new Promise(function(resolve, reject){
            return Auth.findOne({
                where : {
                    auth_id: id,
                    auth_type: authType
                }
            }).then(function(auth){
                if(!auth){
                    throw AppError.throwAppError(404, "Not exist auth info");
                }
                resolve(auth);
            }).catch(function(err){
		if(err.isAppError){
		    return reject(err);
		}
		reject(AppError.throwAppError(500, err.toString()));
            });
        });
    };

    return Auth;
};
