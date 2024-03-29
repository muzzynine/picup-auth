/**
 * Created by impyeong-gang on 1/6/16.
 */
'use strict'

var Promise = require('bluebird');
var querystring = require('querystring');
var https = require('https');
var config = require('../config/config');
var AppError = require('./appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('OAuthLogger');


exports.getUserInfo = function(accessToken) {
    return new Promise(function(resolve, reject){
        var kakaoUserId;
        var kakaoUserProperties = {
            nickname : "",
            thumbnailImage : "",
            profileImage : ""
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
                                kakaoUserProperties.thumbnailImage = response.properties.thumbnail_image || "";
                                kakaoUserProperties.profileImage = response.properties.profile_image || "";
                            }
                            return resolve({
                                id : kakaoUserId,
                                properties : kakaoUserProperties
                            });
                        }
                        reject(AppError.throwAppError(400, "Request success, but not include auth Id"));
                        break;

                    case 400:
                        // 일반적인 오류. 주로 API에 필요한 필수 파라미터와 관련
                    case 401:
                        // 인증 오류 주로 사용자 토큰과 관련
                    case 403:
                        // 권한/퍼미션등의 오류
                        reject(AppError.throwAppError(403, "kakao oauth Authentication error"));
			break;

		    case 500:
                    default:
                        reject(AppError.throwAppError(500, "kakao oauth internal error"));
                        break;
                    }
                });
	    });
        req.end();
    });
};


exports.unlinkUserInfo = function(targetId) {
    return new Promise(function(resolve, reject){
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
		    return resolve();
                    break;

                case 400:
                    // 일반적인 오류. 주로 API에 필요한 필수 파라미터와 관련
                case 401:
                    // 인증 오류 주로 사용자 토큰과 관련
                case 403:
                    // 권한/퍼미션등의 오류
		    return reject(AppError.throwAppError(403));
		    break;
                case 500:
                default:
                    log.error("kakao#getUserInfo/facebook oauth error");
                    return reject(AppError.throwAppError(500));
                    break;
                }
            });
        });
	req.write(body);
	req.end();
    });
};
