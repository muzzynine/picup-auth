'use strict';

/**
 * Created by impyeong-gang on 9/17/15.
 */
var accessToken = require('../model/accessToken');
var utils = require('./utils');
var AppError = require('../lib/appError');

/**
 * 토큰을 생성한다
 * @param client_id
 * @param username
 * @param grantType
 * @param fn
 * @param scope
 */
var createToken = function(grantType, scope){
    var token = {};
    token.access_token = utils.uid(64);
    if(grantType.token_refreshable){
        token.refresh_token = utils.uid(64);
    }
    token.expired_in = grantType.token_duration;
    token.created_time = Date.now();

    for(var i in scope){
        token.scope.push(scope[i]);
    }

    return token;
};

var refreshToken = function(token){
    token.access_token = utils.uid(64);
    token.created_time = Date.now();
    return token
};

var validateToken = function(token){
    if((Date.now() - token.created_time) > (token.expired_in * 1000)){
        return false
    }
    return true;
};

module.exports.create = createToken;
module.exports.refresh = refreshToken;
module.exports.validate = validateToken;
