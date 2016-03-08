'use strict';

/**
 * Created by impyeong-gang on 11/5/15.
 */
var Promise = require('bluebird');
var https = require('https');
var config = require('../config');
var AppError = require('./appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('OAuthLogger');

exports.getUserInfo = function(accessToken, fn) {
    return new Promise(function(resolve, reject){
        var facebookId;
        var facebookProperties = {
            nickname : "",
            sex : null,
            age : null
        };

        var req = https.request({
                hostname: config.OAUTH.FACEBOOK.HOST,
                port: config.OAUTH.FACEBOOK.PORT,
                path: config.OAUTH.FACEBOOK.PATH.GET_USER_INFO + "?access_token=" + accessToken,
                method: 'GET'
            }, function (res) {
                var body = "";
                var statusCode = res.statusCode;
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    body += chunk;
                });
                res.on('end', function () {
                    var response = JSON.parse(body);
                    switch (statusCode) {
                        case 200 :
                            if(response) {
                                facebookId = response.id;
                                facebookProperties.nickname = response.name;
                                return resolve({
                                    id : facebookId,
                                    properties : facebookProperties
                                });
                            }
                            return reject(AppError.throwAppError(400));
                            break;

                        case 400:
                        // 일반적인 오류. 주로 API에 필요한 필수 파라미터와 관련
                        case 401:
                        // 인증 오류 주로 사용자 토큰과 관련
                        case 403:
                            // 권한/퍼미션등의 오류
                            return reject(AppError.throwAppError(400));
                        case 500:
                        default:
                            log.error("facebook#getUserInfo/facebook oauth error");
                            return reject(new AppError.throwAppError(500));
                            break;
                    }
                });
            }
        );
        req.end();
    });
};


exports.getUserProfile = function(id, fn) {
    var profile;

    var req = https.request({
            hostname: config.OAUTH.KAKAO.HOST,
            port: config.OAUTH.KAKAO.PORT,
            path: config.OAUTH.KAKAO.PATH.UNLINK,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }, function (res) {
            var body = "";
            var statusCode = res.statusCode;
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                var response = JSON.parse(body);
                switch (statusCode) {
                    case 200 :
                    case 400:
                    // 일반적인 오류. 주로 API에 필요한 필수 파라미터와 관련
                    case 401:
                    // 인증 오류 주로 사용자 토큰과 관련
                    case 403:
                        // 권한/퍼미션등의 오류
                        return fn(AppError.throwAppError(403));
                    case 500:
                    default:
                        return fn(AppError.throwAppError(500));
                        break;
                }
            });
        }
    );
    req.end();
};
