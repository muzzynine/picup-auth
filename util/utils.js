'use strict';

/**
 * Created by impyeong-gang on 9/17/15.
 */
var crypto = require('crypto');
var shasum = crypto.createHash('sha1');

/**
 * 고정된 길이의 랜덤한 숫자를 발생시킨다.
 */
exports.getRandomInt = function(length){
    var result = Math.floor(Math.random() * 9 * Math.pow(10, length-1)) + 1000;

    return result;
};


/**
 * Return a unique identifier with the given `len`.
 *
 */

exports.uid = function(len){

    var buf = [];
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charlen = chars.length;

    for(var i = 0; i< len; ++i){
        buf.push(chars[getRandomInt2(0, charlen - 1)]);
    }

    return buf.join('');
};

exports.getSHA1HashString = function(){
    var randomString = this.uid(32);
    return randomString;
};
/**
 * Return a random int, used by `utils.uid()`
 */

exports.contain = function(arr, value){
    var isExist = false;
    for(var i = 0; i < arr.length; i++){
        if(arr[i] === value){
            isExist = true;
            break;
        }
    }
    return isExist;
};

function getRandomInt2(min, max){
    return Math.floor(Math.random() * (max-min +1)) + min;
}

