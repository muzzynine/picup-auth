/**
 * Created by impyeong-gang on 1/11/16.
 */
var DeltaScheme = require('./scheme').DELTA;
var AppError = require('../lib/appError');
var Promise = require('bluebird');
var bunyan = require('bunyan');
var log = bunyan.getLogger('DataModelLogger');

module.exports = function(connection){
    var Delta =  connection.define(DeltaScheme.TABLE, DeltaScheme.SCHEME, DeltaScheme.OPTION);

    Delta.findDeltaById = function(id){
        return new Promise(function(resolve, reject){
            return Delta.findById(id).then(function(delta){
                if(!delta){
                    return reject(AppError.throwAppError(404));
                }
                resolve(delta);
            }).catch(function(err){
                log.error("Delta#findDeltaById", {err: err});
                reject(AppError.throwAppError(500));
            });
        })
    };


    return Delta;
};

