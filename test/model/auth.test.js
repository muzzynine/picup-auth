var logger = require('../../lib/logger');
var db = require('../../model');
var Auth = db.auth;
var User = db.user;

describe('Auth - authentication/authorization/verify client/user', function(){
    describe('#authentication', function(){
	it('It works for me', function(done){
	    done();
	});
    });

    describe('#getUser', function(){
	var testAuth;
	var testUser;
 	
	before(function(done){
	    return User.create({
		
	    return Auth.create({
		auth_id : "testId",
		auth_type : "kakao"}).then(function(auth){
		    testAuth = auth;
		    
		    return Auth.createUser({
			nickname : "testName",
			profile_path : "testProfile"
		    }).then(function(user){
			testUser = user;
			done();
		    });
		}).catch(function(err){
		    done(err);
		});
	})
	       	       
	it('It works for me', function(done){
	    Auth.getUser(testAuth).then(function(user){
		if(testUser.nickname === user.nickname && testUser.profile_path === user.profile_path) return done();
		throw new Error("Test failed. expected nickname : " + testUser.nickname + ", profile_path : " + testUser.profile_path + ", but actual nickname : " + user.nickname + ", profile_path : " + user.profile_path);
	    }).catch(function(err){
		done(err)
	    });
	});
    });
});
