'use strict';

/**
 * Created by impyeong-gang on 9/17/15.
 */
var accessToken = require('../model/accessToken');
var utils = require('./utils');
var AppError = require('../lib/appError');
var uuid = require('uuid');

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
    token.accessToken = uuid.v1();
    if(grantType.tokenRefreshable){
        token.refreshToken = uuid.v1();
    }
    token.expiredIn = grantType.tokenDuration;
    token.createdTime = Date.now();

    for(var i in scope){
        token.scope.push(scope[i]);
    }

    return token;
};

var refreshToken = function(token){
    token.accessToken = uuid.v1();
    token.createdTime = Date.now();
    return token;
};

var validateToken = function(token){
    if((Date.now() - token.createdTime) > (token.expiredIn * 1000)){
        return false;
    }
    return true;
};

module.exports.create = createToken;
module.exports.refresh = refreshToken;
module.exports.validate = validateToken;
