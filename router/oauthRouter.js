'use strict';

/**
 * Created by impyeong-gang on 9/17/15.
 */
var express = require("express");
var router = express.Router();

var passport = require('passport');

var auth = require('../lib/auth');
var oauth2 = require('../lib/oauth2');

var bunyan = require('bunyan');
var log = bunyan.getLogger('RouterLogger');


module.exports = router;

/**
 * @api {post} /oauth/generateAPIKey 클라이언트 id, 클라이언트 secrect을 발급한다
 * @apiGroup Auth
 *
 * @apiParam {String} access_token 페이스북 / 카카오톡 액세스 토큰
 * @apiParam {String} auth_type 인증 방식 "kakao"||"facebook"
 *
 * @apiSuccess {String}         uid    유저 아이디
 * @apiSuccess {String}         access_key     클라이언트 액세스 키
 * @apiSuccess {String}         secret_key       클라이언트 시크릿 키
 *
 * @apiError 400 WrongParameter 잘못된 요청
 * @apiError 412 ConditionFailed 잘못된 인증정보로 인증할 수 없음
 * @apiError 500 Internal 서버 오류
 *
 * @apiPermission none
 *
 */
router.post('/generateAPIKey', function(req, res){
    var Auth = req.app.get('models').auth;
    var accessToken = req.body.access_token;
    var authType = req.body.auth_type;

    Auth.authenticate(accessToken, authType).then(function(authInfo){
        return Auth.generateClientKey(authInfo).then(function(clientInfo){
            res.status(200);
            res.json({
                access_key : clientInfo.id,
                secret_key : clientInfo.secret
            });
        });
    }).catch(function(err){
	log.error("#generateAPIKey", {err:err}, {stack:err.stack});
	if(err.isAppError){
	    res.status(err.errorCode);
	    res.json(err);
	} else {
	    res.status(500);
	    res.json({});
	}
    });
});

/**
 * @api {post} /oauth/token OAuth 토큰을 발급한다
 * @apiGroup Auth
 *
 * @apiParam {String} username 액세스 토큰
 * @apiParam {String} password 인증 방식 "kakao"||"facebook"
 * @apiParam {String} client_id 클라이언트에게 발급된 고유 아이디
 * @apiParam {String} client_secret 클라이언트에게 발급된 시크릿 키
 * @apiParam {String} grant-type OAuth 인증 방식 'password'방식만 지원
 * @apiParam {JSONArray} scope picup-user
 *
 * @apiSuccess {String}         access_token    발급된 토큰
 * @apiSuccess {String}         refresh_token   refresh를 위한 토큰
 * @apiSuccess {String}         expires_in      토큰의 유효 기간
 * @apiSuccess {String}         username 토큰이 주어진 사용자 id
 * @apiSuccess {String}         token_type  인증에 사용될 방식. 'bearer' 인증 사용
 * @apiSuccess {JSONArray}         scope
 *
 * @apiError 401 Unauthorized 인증정보로 인증 실패
 * @apiError 500 Internal 서버 오류
 *
 * @apiPermission none
 *
 */
var errorHandler = function (err, req, res, next){
    if(err){
        res.status(err.errorCode);
        res.json(err);
        return;
    }
    next();
};
router.post('/token',
	    /*
    function(req, res, next){
        next();
    },*/
	    passport.authenticate('oauth2-resource-owner-password', {session : false}),
	    oauth2.token()
	   );

/*
router.use(passport.authenticate('bearer', {session: false}), errorHandler);



router.post('/logout', function(req, res){
    var uid = req.user.id;
    var clientId = req.user.client_id;

    console.log(uid);
    console.log(clientId);

    Client.getClientById(clientId, function(err, client){
        if(err) {
            res.status(err.errorCode);
            res.json(err);
            return;
        }
        AccessToken.deleteTokenByUidCid(uid, client.client_id, function(err){
            if(err){
                res.status(err.errorCode);
                res.json(err);
                return;
            }
            res.status(200);
            res.json({
                thanks : "bye"
            });
        });
    })
});
*/
