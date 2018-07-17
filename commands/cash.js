exports.help = {
    name: "cash",
    usage: "cash <action> <@user> <amount>",
    description: "Run different commands to do with cash."
}

const User = require("../models/discordUsers");

exports.run = (bot, message, args) => {
    let action = args[0];
    let amount = args[2];
    if (!action) return message.channel.send(`Please specify an action as one of the following...
    • **send** 
    • **s**`);
    action = action.toLowerCase();

    if (action === "send" || action === "s"){
        let mentioned = message.mentions.users.first();
        if(mentioned){
            if(mentioned.id === message.author.id){
                message.channel.send("You cannot send money to yourself!");
            } else {
                User.findUserByID(mentioned.id, function(err, user){
                    if(err) throw err;
                    if(!user) return message.channel.send("User's bank account not found.");

                    if(!amount) return message.channel.send("Please specify an amount.");
                    amount = parseInt(amount);

                    User.send(message.author.id, mentioned.id, amount);

                    message.channel.send(`**$${amount}** sent to <@${mentioned.id}>,\nThe amount has been removed from your account`);
                });
            }
        }else{
            message.channel.send("Please mention a user.");
        }
    } else if (action === "add" || action === "a"){
        let mentioned = message.mentions.users.first();
        if (mentioned) {
            message.channel.send(mentioned.id);
        } else {
            message.channel.send("Please mention a user.");
        }
    } else if (action === "remove" || action === "r"){
        let mentioned = message.mentions.users.first();
        if (mentioned) {
            message.channel.send(mentioned.id);
        } else {
            message.channel.send("Please mention a user.");
        }
    }else{
        message.channel.send("That is not an action.")
    }
}