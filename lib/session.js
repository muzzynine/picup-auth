var Promise = require('bluebird');
var redis = require('redis');
var client = redis.createClient();

module.exports = RedisSession;

var DEFAULT_TTL = 86400;
var DEFAULT_PREFIX = 'bfg::'

function retryStartegy(options){
    if(options.error.code === 'ECONNREFUSED'){

	return new Error('The server refused the connection');
    }
    if(options.total_retry_time > 1000 * 60 * 60){
	return new Error("Retry time exhausted");
    }

    return Math.max(options.attempt * 100, 3000);
}


    /*
     *options
     * host : redis server hostname
     * port : redis server portno
     * socket : redis server unix_socket
     * url : redis server url
     * pass : redis authentication
     *
     * additional.
     * ttl : redis session TTL in second.
     * disableTTL : disable ttl.
     *  
     */
function RedisSession(options){

    options = options || {};

    this.prefix = options.prefix || DEFAULT_PREFIX;
    delete options.prefix;
    this.client = redis.createClient(options.url, {
	retry_strategy: retryStartegy
    });

    if(options.pass){
	this.client.auth(options.pass, function(err){
	    if(err){
		throw err;
	    }
	});
    }

    this.ttl = options.ttl || DEFAULT_TTL;
    this.disableTTL = options.disableTTL;

    this.client.on('connect', function(){
	console.log("Redis session server connected");
    });
}

RedisSession.prototype.get = function(id){
    var self = this;
    return new Promise(function(resolve, reject){
	var sid = self.prefix + id;

	self.client.get(sid, function(err, data){
	    if(err){
		return reject(AppError.throwAppError(500, err.toString()));
	    }
	    if(!data){
		return reject(AppError.throwAppError(404, "Not exist"));
	    }
	    var result;
	    try{
		result = JSON.parse(data);
	    } catch(err){
		return reject(AppError.throwAppError(500, err.toString()));
	    }
	    resolve(result);
	});
    });
};

RedisSession.prototype.set = function(id, what){
    var self = this;
    return new Promise(function(resolve, reject){
	var args = [];
	args.push(self.prefix + id);
	var data;
	try{
	    data = JSON.stringify(what);
	} catch(err){
	    return reject(AppError.throwAppError(500, err.toString()));
	}
	args.push(data);

	if(!self.disableTTL){
	    args.push('EX', self.ttl);
	}

	self.client.set(args, function(err){
	    if(err){
		return reject(AppError.throwAppError(500, err.toString()));
	    }
	    resolve({
		id : id,
		data : what
	    });
	});
    });
};


RedisSession.prototype.destroy = function(id){
    var self = this;
    return new Promise(function(resolve, reject){
	var sid = self.prefix+id;
	self.client.del(sid, function(err){
	    if(err){
		return reject(AppError.throwAppError(500, err.toString()));
	    }
	    resolve();
	});
    });
};

RedisSession.prototype.touch = function(id, what){
    var self = this;
    return new Promsie(function(resolve, reject){
	var sid = self.prefix+id;
	if(self.disableTTL){
	    return resolve({
		id : id,
		data : what
	    });
	}

	self.client.expire(sid, self.ttl, function(err){
	    if(err){
		return reject(AppError.throwAppError(500, err.toString()));
	    }
	    resolve({
		id : id,
		data : what
	    });
	});
    });
};


