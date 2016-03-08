/**
 * Created by impyeong-gang on 1/11/16.
 */

var Promise = require('bluebird');
var ClientScheme = require('./scheme').CLIENT;
var AppError = require('../lib/appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('DataModelLogger');


module.exports = function(connection){
    var Client = connection.define(ClientScheme.TABLE, ClientScheme.SCHEME);

    Client.getAuthInfo = function(clientId, clientSecret){
        return new Promise(function(resolve, reject){
            return Client.findOne({
                where : {
                    client_id : clientId,
                    client_secret : clientSecret
                }
            }).then(function(client){
                if(!client){
                    return reject(AppError.throwAppError(404));
                }
                return client.getAuth().then(function(auth){
                    if(!auth){
                        return reject(AppError.throwAppError(404));
                    }
                    resolve(null, auth);
                }).catch(function(err){
                    log.error("Client#getAuthInfo", {err: err});
                    reject(AppError.throwAppError(500));
                })
            }).catch(function(err){
                log.error("Client#getAuthInfo", {err: err});
                reject(AppError.throwAppError(500));
            })
        })
    };

    return Client;
};
