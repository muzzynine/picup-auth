/**
 * Created by impyeong-gang on 1/11/16.
 */
var Promise = require('bluebird');
var UserShceme = require('./scheme').USER;
var AppError = require('../lib/appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('DataModelLogger');
var Kakao = require('../lib/kakao');
var Facebook = require('../lib/facebook');

module.exports = function(connection){
    var User = connection.define(UserShceme.TABLE,
        UserShceme.SCHEME, {
            instanceMethods: {
                getProfile : function(){
                    return {
                        uid : user.id,
                        nickname : user.nickname,
                        pic_s3path : user.profile_path
                    }
                }
            }
        });

    User.findUserById = function(uid){
        return new Promise(function(resolve, reject){
            return User.findOne({
                where : {
                    id : uid
                }
            }).then(function(user){
                if(!user){
                    return reject(AppError.throwAppError(404));
                }
                resolve(user);
            }).catch(function(err){
                log.error("User#findUserById/DB(RDBMS) Internal error", {err: err});
                reject(AppError.throwAppError(500));
            });
        })
    };

    User.getProfile = function(uid){
        return new Promise(function(resolve, reject){
            return User.findUserById(uid).then(function(user){
                resolve({
                    uid : user.id,
                    nickname : user.nickname,
                    pic_s3path : user.profile_path
                })
            }).catch(function(err){
                log.error("User#getProfile", {err: err});
                reject(err);
            })
        })
    };

    User.getAccessToken = function(uid){
        return new Promise(function(resolve, reject){
            return User.findUserById(uid).then(function(user){
                return user.getAuth().then(function(auth){
                    if(!auth){
                        return reject(AppError.throwAppError(403));
                    }
                    return auth.getAccessToken().then(function(token){
                        if(!token){
                            return reject(AppError.throwAppError(404));
                        }
                        return resolve(token);
                    }).catch(function(err){
                        log.error("User#getAccessToken/DB(RDBMS) Internal error", {err: err});
                        return reject(AppError.throwAppError(500));
                    })
                }).catch(function(err){
                    log.error("User#getAccessToken/DB(RDBMS) Internal error", {err: err});
                    return reject(AppError.throwAppError(500));
                });
            }).catch(function(err){
                log.error("User#getAccessToken", {err: err});
                return reject(err);
            });
        })
    };

    User.setAccessToken = function(uid, token, fn){
        return new Promise(function(resolve, reject){
            return User.findUserById(uid).then(function(err, user){
                user.getAuth().then(function(auth){
                    if(!auth){
                        return reject(AppError.throwAppError(403));
                    }
                    auth.createAccessToken({
                        access_token : token.access_token,
                        refresh_token : token.refresh_token,
                        expired_in : token.expired_in,
                        created_date : token.created_date
                    }).then(function(){
                        resolve(token);
                    }).catch(function(err){
                        log.error("User#setAccessToken/DB(RDBMS) Internal error", {err: err});
                        reject(AppError.throwAppError(500));
                    })
                }).catch(function(err){
                    log.error("User#setAccessToken/DB(RDBMS) Internal error", {err: err});
                    reject(AppError.throwAppError(500));
                });
            }).catch(function(err){
                log.error("User#setAccessToken", {err: err});
                reject(err);
            });
        })
    };

    User.register = function(authId, nickname, mail, sex, birth, phoneNumber, authType){
        return new Promise(function(resolve, reject){
            connection.transaction(function(t){
                return User.create({
                    nickname : nickname,
                    profile_path : "default",
		    mail : mail || null,
		    sex : sex || "unknown",
		    birth : birth || null,
		    phoneNumber : phoneNumber || null
                }, {transaction: t}).then(function(user){
                    return user.createAuth({
                        auth_id : authId,
                        auth_type : authType,
			isBan : false
                    }, {transaction: t}).then(function(){
                        return user;
                    });
                }).catch(function(err){
		    throw err;
                });
            }).then(function(user){
                resolve(user);
            }).catch(function(err){
		if(err.isAppError){
		    return reject(err);
		}
                reject(AppError.throwAppError(500, err.toString()));
            });
        });
    };

    User.signout = function(user){
	return new Promise(function(resolve, reject){
	    user.getAuth().then(function(auth){
		return connection.transaction(function(t){
		    return user.destroy({transaction : t}).then(function(){
			if(auth.auth_type === "kakao"){
			    return Kakao.unlinkUserInfo(auth.auth_id).then(function(){
				return;
			    });
			} else {
			    throw AppError.throwAppError(400, "signout is support only kakao account");
			}
		    }).catch(function(err){
			throw err;
		    });
		}).then(function(){
		    resolve();
		});
	    }).catch(function(err){
		if(err.isAppError){
		    return reject(err);
		}
		reject(AppError.throwAppError(500, err.toString()));
	    });
	});
    };


    User.findUserByOAuthId = function(authId, authType, fn){
        return new Promise(function(resolve, reject){
            return User.findOne({
                auth_id : authId
            }).then(function(users){
                var uList = users.slice(0);
                var targetUser = null;
                (function findOAuthUser(){
                    if(targetUser){
                        return resolve(targetUser);
                    }
                    if(uList.length === 0){
                        return reject(AppError.throwAppError(404));
                    }
                    var user = uList.splice(0, 1)[0];
                    return user.getAuthType().then(function(userAuthType){
                        if(userAuthType === authType){
                            targetUser = user;
                            return setTimeout(findOAuthUser, 0);
                        }
                        setTimeout(findOAuthUser, 0);
                    }).catch(function(err){
                        log.error("User#findUserByOAuthId/DB(RDBMS) Internal error", {err: err});
                        return reject(AppError.throwAppError(500));
                    });
                })();
            }).catch(function(err){
                log.error("User#findUserByOAuthId/DB(RDBMS) Internal error", {err: err});
                return reject(AppError.throwAppError(500));
            });
        })
    };

    return User;

};

