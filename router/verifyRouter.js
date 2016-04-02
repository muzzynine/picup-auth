/**
 * Created by impyeong-gang on 12/7/15.
 */
var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../model/user');

var tokenizer = require('../util/tokenizer');
var AppError = require('../lib/appError');

module.exports = router;


/**
 * @api {get} /verify/token 요청의 액세스토큰을 검증한다.
 * @apiGroup Auth
 *
 * @apiParam {String} accessToken   액세스 토큰
 *
 * @apiSuccess {String}         accessToken    액세스 토큰디
 * @apiSuccess {String}         uid     유저 아이디
 * @apiSuccess {String[]}       scope       해당 토큰의 권한
 *
 * @apiError 403 InvalidToken 토큰이 존재하나, 유효하지 않은 토큰
 * @apiError 404 NotExistResource 토큰이 존재하지 않을 때
 * @apiError 500 Internal 서버 오류
 *
 * @apiPermission picup-user
 *
 */

router.get('/token', passport.authenticate('bearer', { session : false }), function(req, res){
    res.status(200);
    res.json({
	uid : req.user.id
    });
});
