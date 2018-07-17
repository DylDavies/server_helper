exports.help = {
    name:`rules`,
    usage:`rules`,
    description:`Get a dm of the rules`
}

const fs = require("fs");
const rules = fs.readFileSync("./storage/rules.txt", "utf8");

exports.run = (bot, message, args) => {
    message.author.send(rules);
}