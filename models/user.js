var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
let bot = require("../app");

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	bio: {
		type: String
	},
	admin: {
		type: Boolean
	},
	discordAccessToken: {
		type: String
	},
	discordRefreshToken: {
		type: String
	},
	discordUsername: {
		type: String
	},
	discordDiscriminator: {
		type: String
	},
	discordID: {
		type: String
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
			newUser.password = hash;
			newUser.bio = "None"
			newUser.admin = false;
			newUser.discordAccessToken = null;
			newUser.discordRefreshToken = null;
			newUser.discordUsername = null;			
		    newUser.discordDiscriminator = null;
			newUser.discordID = null;
			newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}

module.exports.editUser = function(username, toUpdate, newVal){
	var query = { username: username };
	if(toUpdate.toLowerCase() === 'admin'){
		User.updateOne(query, {
			$set: {
				admin: newVal
			}
		}, function (err) {
			if (err) throw err;
		});
	}else if(toUpdate.toLowerCase() === 'username'){
		User.updateOne(query, {
			$set: {
				username: newVal
			}
		}, function(err){
			if(err) throw err;
		});
	}else if(toUpdate.toLowerCase() === 'password'){
		User.updateOne(query, {
			$set: {
				password: newVal
			}
		}, function(err){
			if(err) throw err;
		});
	}else if(toUpdate.toLowerCase() === 'email'){
		User.updateOne(query, {
			$set: {
				email: newVal
			}
		}, function(err){
			if(err) throw err;
		});
	}else if(toUpdate.toLowerCase() === 'bio'){
		User.updateOne(query, {
			$set: {
				bio: newVal
			}
		}, function(err){
			if(err) throw err;
		});
	}
};

module.exports.editPass = function(username, newPass){
	bcrypt.genSalt(10, function (err, salt) {
		bcrypt.hash(newPass, salt, function (err, hash) {
			User.updateOne({username: username}, {$set: {
				password: hash
			}}, function(err){
				if(err) throw err;
			});
		});
	});
};

module.exports.addDiscord = async function(username, accessToken, refreshToken, dusername, discrim, id){
	let query = {username: username};
	await User.updateOne(query, {
		$set:{
			discordAccessToken: accessToken,
			discordRefreshToken: refreshToken,
			discordUsername: dusername,
			discordDiscriminator: discrim,
			discordID: id
		}
	}, function(err){
		if(err) throw err;
	});

	let user = await bot.guilds.get("461165458049990666").members.get(id);
	let role = await bot.guilds.get("461165458049990666").roles.find("name", "Web Auth");
	user.addRole(role);
}