let mongoose = require("mongoose");
let bot = require("../app");

let UserSchema = mongoose.Schema({
    userID: {
        type: String
    },
    currency: {
        type: String
    },
    lastDaily: {
        type: String
    },
    benifits: {
        type: Boolean
    }
});

let discordUser = module.exports = mongoose.model("discordUser", UserSchema);

module.exports.createUser = async function(newUser, callback){
    newUser.save(callback);
}

module.exports.findUserByID = function(id, callback){
    let query = {userID: id};
    discordUser.findOne(query, callback);
}

module.exports.addCurrency = async function(id){
    let query = {userID: id};
    let currency;
    let gen = Math.floor(Math.random() * 1000) + 1

    await discordUser.findOne(query, function(err, user){
        if (err) throw err;
        if (!user) throw new Error("User Not Found");

        currency = parseInt(user.currency) + gen;
        currency = currency.toString();
    });

    console.log(currency);

    await discordUser.updateOne(query, {
        $set: {
            currency: currency
        }
    }, function (err) {
        if (err) throw err;
    });

    return gen;
}

module.exports.setDaily = function (id, time){
    discordUser.findOneAndUpdate({userID: id},{
        $set: {
            lastDaily: time
        }
    }, function (err){
        if (err) throw err;
    })
}

module.exports.compareDaily = async function (id, time) {
    let isTrue;
    await discordUser.findOne({userID: id}).then(user => {
        if(user.lastDaily !== time) isTrue = true;
        else isTrue = false;
        return isTrue;
    }, function (err) {
        if (err) throw err;
    });

    return isTrue;
}

module.exports.getDaily = async function (id) {
    let last = await discordUser.findOne({userID: id}).then(user => {
        return user.lastDaily
    }, function (err) {
        if (err) throw err;
    });

    return last;
}

module.exports.send = async function(authorid, id, amount){
    let currency;
    let remove;

    await discordUser.findOne({userID: id}, function (err, user) {
        if (err) throw err;
        if (!user) throw new Error("User Not Found");

        currency = parseInt(user.currency) + amount;
        currency = currency.toString();
    });

    await discordUser.updateOne({userID: id}, {
        $set: {
            currency: currency
        }
    }, function (err) {
        if (err) throw err;
    });

    await discordUser.findOne({ userID: authorid }, function (err, user) {
        if (err) throw err;
        if (!user) throw new Error("User Not Found");

        remove = parseInt(user.currency) - amount;
        remove = remove.toString();
    });

    await discordUser.updateOne({userID: authorid}, {
        $set: {
            currency: remove
        }
    }, function (err) {
        if (err) throw err;
    });
}