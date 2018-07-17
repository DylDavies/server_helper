exports.help = {
    name:"myprof",
    usage:"myprof",
    description:"Get your profile link"
}

exports.run = (bot, message, args) => {
    message.channel.send("TESTING/" + message.author.id)
}