exports.help = {
    name: 'daily',
    usage: 'daily',
    description: 'Collect your daily cash!'
}

// let mongoose = require("mongoose");
let User = require("../models/discordUsers");
let moment = require("moment");

exports.run = async (bot, message, args) => {
    let last = await User.getDaily(message.author.id);
    if (last){
        let goAhead = await User.compareDaily(message.author.id, moment().format("L"));

        if(goAhead){
            let gen = await User.addCurrency(message.author.id);
            await User.setDaily(message.author.id, moment().format("L"));
            message.channel.send({embed:{
                title: "Daily Reward",
                color: 0xff0000,
                description: `A random amount , **$${gen}** , was added to your account!`
            }});
        } else {
            message.channel.send({embed:{
                title: "Daily Reward",
                color: 0xff0000,
                description: `Already Collected,\nComeback in ${moment().endOf("day").fromNow()}`
            }})
        }
    } else {
        message.reply("Account not created,\nSend any non-command message to open one.")
    }
}