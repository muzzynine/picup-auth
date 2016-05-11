/**
 * Created by impyeong-gang on 1/11/16.
 */
var Promise = require('bluebird');
var AccessTokenScheme = require('./scheme').ACCESS_TOKEN;
var AppError = require('../lib/appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('DataModelLogger');

module.exports = function(connection){
    var AccessToken =  connection.define(AccessTokenScheme.TABLE, AccessTokenScheme.SCHEME, AccessTokenScheme.OPTION);

    AccessToken.findAccessTokenByValue = function(inputToken){
        return AccessToken.findOne({
            where : {
		isAlive : true,
                accessToken : inputToken
            }
        }).then(function(token){
            if(!token){
                throw AppError.throwAppError(404, "Not exist token");
            }
            return token;
        });
    };

    return AccessToken;
};
