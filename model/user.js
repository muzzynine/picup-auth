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
    var User = connection.define(UserShceme.TABLE, UserShceme.SCHEME, UserShceme.OPTION);

    User.register = function(authId, nickname, mail, sex, birth, phoneNumber, authType){
        return connection.transaction(function(t){
            return User.create({
                nickname : nickname,
                profilePath : "default",
		mail : mail || "unknown",
		sex : sex || "unknown",
		birth : birth || 0,
		phoneNumber : phoneNumber || "unknown",
            }, {transaction: t}).then(function(user){
                return user.createAuth({
                    authId : authId,
                    authType : authType,
		    isBan : false
                }, {transaction: t}).then(function(){
                    return user;
                });
            }).catch(function(err){
		throw err;
            });
        }).then(function(user){
            return user;
        });
    };

    User.signout = function(user, reason){
	return user.getAuth().then(function(auth){
	    if(auth.authType !== "kakao" && auth.authType !== "facebook"){
		throw AppError.throwAppError(400, "signout is support only kakao account");
	    }
	    return user.getPushRegistration().then(function(pushInfo){
		return auth.getClient().then(function(client){
		    return auth.getAccessToken().then(function(accessToken){
			return [user, auth, pushInfo, client, accessToken, reason];
		    });
		});
	    });
	}).spread(function(u, a, p, c, at, reason){
	    return connection.transaction(function(t){
		return a.update({
		    isAlive : false,
		    deletedAt : Date.now()
		}, {transaction : t}).then(function(){
		    return u.update({
			isAlive : false,
			deletedAt : Date.now(),
			deleteReason : reason
		    }, {transaction : t})
		}).then(function(){
		    return p.update({
			isAlive : false,
			deletedAt : Date.now()
		    }, {transaction : t})
		}).then(function(){
		    return c.update({
			isAlive : false,
			deletedAt : Date.now()
		    }, {transaction : t})
		}).then(function(){
		    return c.update({
			isAlive : false,
			deletedAt : Date.now()
		    }, {transaction : t})
		}).then(function(){
		    return at.update({
			isAlive : false,
			deletedAt : Date.now()
		    }, {transaction : t})
		}).then(function(){
		    if(a.authType === "kakao"){
			//유저의 Kakao 연동을 해제한다.
			return Kakao.unlinkUserInfo(a.authId).then(function(){
			    return;
			});
		    } else if(a.authType === "facebook"){
			//Facebook의 경우 아무것도 하지 않는다.
			return;
		    } else {
			throw AppError.throwAppError(400, "Not supported auth type");
		    }
		});
	    }).catch(function(err){
		throw err;
	    });
	}).then(function(){
	    return;
	});
    };

    return User;

};

