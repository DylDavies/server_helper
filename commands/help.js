exports.help = {
    name:`help`,
    usage: `help`,
    description:`Get help on other commands!`
}

exports.run = (bot, message, args) => {
    if (args[0]) {
        args[0] = args[0].toLowerCase();
        let cmd = bot.commands.get(args[0]);
        if (!cmd) return message.channel.send(`Sorry, the command : **${args[0]}** ,does not exist`);
        message.channel.send(`= ${cmd.help.name} = \n${cmd.help.description}\nusage:: ${bot.prefix}${cmd.help.usage}\n= ${cmd.help.name} =`, { code: "asciidoc" });
    } else {
        let mess = `\`\`\`asciidoc\n= Help = \nDo ${bot.prefix}help <commandname> for more help on the specific command!\n\n`
        bot.commands.forEach(cmd => {
            mess += `${cmd.help.name} \n:: Usage ${bot.prefix}${cmd.help.usage} \n:: ${cmd.help.description}\n\n`
        })
        mess += `\`\`\``
        message.channel.send(mess);
    }
}