exports.help = {
    name:`startteam`,
    usage:`startteam <Game Name>`,
    description:`Send a request to start a new esports team!`
}

const nodemailer = require("nodemailer");
const db = require("quick.db");

exports.run = async (bot, message, args) => {

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 10; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    const ref = makeid();
    const game_name = args.join(" ");
    if (!game_name) return message.channel.send(`You need to specify a game!`);
    const submitter = message.author;

    await db.updateText(`${ref}_gameName`, game_name);
    await db.updateText(`${ref}_submitterID`, submitter.id);
    
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, 
        auth: {
            user: 'serverhelperbot@gmail.com',
            pass: 'Dylan1Davies'
        }
    });

    let mailOptions = {
        from: '"Server Helper" <serverhelperbot@gmail.com>',
        to: 'dyldavies11@gmail.com, Lazyraiinbow@gmail.com',
        subject: 'Test',
        html: `
            <h3>New Team Submission</h3>
            <h4>Stats</h4>
            <p>Ref Number: ${ref}</p>
            <p>Game: ${game_name}</p>
            <p>Submitter: ${submitter.username}</p>
            <p>Submitter ID: ${submitter.id}</p>
        `};

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });

    message.channel.send(`Request Sent!`);
}