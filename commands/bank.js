module.exports.help = {
    name: "bank",
    usage: "bank",
    description: "Check your balance."
}

const User = require("../models/discordUsers");

module.exports.run = (bot, message, args) => {
    User.findUserByID(message.author.id, function(err, user){
        if(err) throw err;
        if (!user) return message.channel.send("Account not opened...\nSend any non-command message to open one!!!");
        
        message.channel.send({embed:{
            title: "Balance",
            color: 0xff0000,
            description: `
            Total: **$${user.currency}**
            `
        }});
    });
}