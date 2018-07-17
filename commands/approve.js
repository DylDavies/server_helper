exports.help = {
    name:"approve",
    usage:"approve <Ref Number>",
    description:"Approve a new team!"
}

const Discord = require("discord.js");
const db = require("quick.db");

exports.run = async (bot, message, args) => {
    //Remember to add command protection

    let ref = args[0];

    db.fetchObject(`${ref}_gameName`).then(name => {
        if(!name.text) return message.channel.send("Invalid Reference Number");
        if(name.text === `null`) return message.channel.send("This Reference Number Has Already Been Approved");

        db.fetchObject(`${ref}_submitterID`).then(id => {
            if (!id.text) return message.channel.send("Invalid Reference Number");
            if (id.text === `null`) return message.channel.send("This Reference Number Has Already Been Approved");

            db.fetchObject("teams_total").then(async teams => {
                let total;
                if(!teams.text) total = 1;
                else total = parseInt(teams.text) + 1;

                let role = await message.guild.createRole({
                    name: `${name.text} eSports`
                });

                message.channel.send(`Role created by the name of **${role.name}** !`);

                let channel = await message.guild.createChannel(`${name.text}-esports`, `text`, [{
                    id: message.guild.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    type: `role`,
                    id: role.id,
                    allow: ["VIEW_CHANNEL"]
                }]);

                message.channel.send(`Channel Created!`);

                await channel.setParent("461459072777191426");

                message.channel.send("Channel added to Team Chats!")

                await message.guild.members.get(`${id.text}`).addRole(role);

                message.channel.send(`<@${id.text}>'s role has been added`);

                db.updateText(`${ref}_gameName`, `null`);
                db.updateText(`${ref}_submitterID`, `null`);
                db.updateText("teams_total", `${total}`);
                message.channel.send("Teams total updated");

                message.channel.send("Complete!");
            })
        })
    })
}