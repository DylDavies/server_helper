exports.help = {
    name:`verify`,
    usage:`verify`,
    description:`Verify yourself as a non-bot user!`
}

const fs = require("fs");
const rules = fs.readFileSync("./storage/rules.txt", "utf8");

exports.run = async (bot, message, args) => {
    if (message.channel.id != `461202548376862732`) return;

    if(message.author.bot){
        message.channel.send("```Bot Detected```");
        return;
    }

    let role = message.guild.roles.find(`name`, `Verified`);
    
    if(message.member.roles.has(role.id)){
        message.channel.send("You are already verified!");
    }else{
        message.member.addRole(role);
        message.author.send(rules);
        message.channel.send("Verified!");
    }
}