'use strict';

/**
 * Created by impyeong-gang on 9/18/15.
 */
var express = require('express');
var router = express.Router();
var appError = require('../lib/appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('RouterLogger');


router.post('/signin', function(req, res){
        res.redirect(307, 'http://localhost:8080/oauth/token');
    }
);


/**
 * 회원가입을 한다
 */

/**
 * @api {post} /membership/connect OAuth를 통해 서비스를 시작한다.
 * @apiGroup Auth
 *
 * @apiParam {String} access_token facebook, kakao에서 발급한 액세스 토큰
 * @apiParam {String} auth_type     인증방식 "kakao" || "facebook"
 *
 * @apiSuccess {String}         uid      가입된 유저의 유저아이디
 * @apiSuccess {String}         username 사용자 id
 * @apiSuccess {String}         auth_type   인증 방식
 *
 * @apiError 400 WrongRequest 인증번호 인증 실패
 * @apiError 420 RedundantResource 이미 존재하는 아이디
 * @apiError 500 Internal 서버 오류
 *
 * @apiPermission none
 *
 */
/* Kakao, Facebook 가입 로직 필요 */
router.post('/connect', function(req, res){
    var User = req.app.get('models').user;
    var Auth = req.app.get('models').auth;
    var data = req.body;
    var accessToken = data.access_token;
    var authType = data.auth_type;

    Auth.authenticate(accessToken, authType).then(function(authInfo, info){
        return Auth.getUser(authInfo).then(function (existUser) {
            res.status(200);
            res.json({
                uid: existUser.id,
                nickname: existUser.nickname,
                auth_type: authType
            });
        }).catch(function(err){
            //일반적인 상황에서 이 catch에 들어오는 예외중 404는 예상하지 못한 오류로 처리해야한다.
            //인증 정보가 있는데 해당 유저가 없다는 경우는 의도하지 않은 경우이기 때문이다.
            res.status(err.errorCode);
            res.json(err);
        });
    }).catch(function(err){
        if(err.errorCode === 404){
            var info = err.info;
            return User.register(info.id, info.properties.nickname, authType).then(function(user){
                res.status(200);
                res.json({
                    uid : user.id,
                    nickname : user.nickname,
                    auth_type : authType
                });
            }).catch(function(err){
                res.status(err.errorCode);
                res.json(err);
            })
        } else {
            res.status(err.errorCode);
            res.json(err);
        }
    });
});


/**
 * 로그아웃을 한다
 */
/*
router.post('/signout', passport.authenticate('bearer', { session: false}),
    oauth2.error(), function(req, res){
        var data = req.body;
        var username = data.username;

        accessToken.remove({
            username: username
        }, function(err){
            if(err){
                res.status(500);
                res.json({
                    error: err.name,
                    error_description: err.message
                });
                return;
            }
            res.status(200);
            res.json({
                good: "bye"
            });
        });
    }
);
*/


module.exports = router;
