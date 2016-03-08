/**
 * Created by impyeong-gang on 1/11/16.
 */
var GroupScheme = require('./scheme').GROUP;
var AppError = require('../lib/appError');

module.exports = function(connection){
    return connection.define(GroupScheme.TABLE, GroupScheme.SCHEME);
};

