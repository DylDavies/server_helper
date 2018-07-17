exports.help = {
    name: 'ascii',
    usage: 'ascii',
    description: 'Create some ascii art!'
}

const ascii = require("ascii-art");

exports.run = (bot, message, args) => {
    if (!args[0]) return message.channel.send("Please specify a message.");

    ascii.font(args.join(" "), "Doom", function(rendered){
        rendered = rendered.trimRight();

        if(rendered.length > 2000) return message.channel.send("Sorry this message is too long!");

        message.channel.send(rendered, {
            code: "md"
        })
    });
}