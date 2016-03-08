/**
 * Created by impyeong-gang on 1/6/16.
 */
'use strict'

var Promise = require('bluebird');
var https = require('https');
var config = require('../config');
var AppError = require('./appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('OAuthLogger');


exports.getUserInfo = function(accessToken, fn) {
    return new Promise(function(resolve, reject){
        var kakaoUserId;
        var kakaoUserProperties = {
            nickname : "",
            thumbnail_image : "",
            profile_image : ""
        };

        var req = https.request({
                hostname: config.OAUTH.KAKAO.HOST,
                port: config.OAUTH.KAKAO.PORT,
                path: config.OAUTH.KAKAO.PATH.GET_USER_INFO,
                method: 'GET',
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
                            if(response.id) {
                                kakaoUserId = response.id.toString();
                                if(response.properties) {
                                    kakaoUserProperties.nickname = response.properties.nickname || "";
                                    kakaoUserProperties.thumbnail_image = response.properties.thumbnail_image || "";
                                    kakaoUserProperties.profile_image = response.properties.profile_image || "";
                                }
                                return resolve({
                                    id : kakaoUserId,
                                    properties : kakaoUserProperties
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
                            return reject(AppError.throwAppError(403));
                        case 500:
                        default:
                            return reject(new AppError.throwAppError(500));
                            break;
                    }
                });
            }
        );
        req.end();
    })
};


exports.unlinkUserInfo = function(targetId, fn) {
    var kakaoUserId;

    var body = querystring.stringify({
            target_id_type: "user_id",
            target_id: targetId
        });

    var req = https.request({
            hostname: config.OAUTH.KAKAO.HOST,
            port: config.OAUTH.KAKAO.PORT,
            path: config.OAUTH.KAKAO.PATH.UNLINK,
            method: 'POST',
            headers: {
                'Authorization': 'KakaoAK ' + config.OAUTH.KAKAO.ADMIN_KEY,
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
                        if(response.id) {
                            kakaoUserId = response.id;

                            return fn(null, {
                                id : kakaoUserId
                            });
                        }
                        return fn(AppError.throwAppError(400));
                        break;

                    case 400:
                    // 일반적인 오류. 주로 API에 필요한 필수 파라미터와 관련
                    case 401:
                    // 인증 오류 주로 사용자 토큰과 관련
                    case 403:
                        // 권한/퍼미션등의 오류
                        return fn(AppError.throwAppError(400));
                    case 500:
                    default:
                        log.error("kakao#getUserInfo/facebook oauth error");
                        return fn(new AppError.throwAppError(500));
                        break;
                }
            });
        }
    );
    req.write(body);
    req.end();
};
