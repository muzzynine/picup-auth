/**
 * Created by impyeong-gang on 1/11/16.
 */

var Promise = require('bluebird');
var ClientScheme = require('./scheme').CLIENT;
var AppError = require('../lib/appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('DataModelLogger');


module.exports = function(connection){
    return connection.define(ClientScheme.TABLE, ClientScheme.SCHEME, ClientScheme.OPTION);

};
