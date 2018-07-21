const Discord = require("discord.js");
const fs = require("fs");
const datab = require("quick.db");
const mongo = require('mongodb');
const mongoose = require('mongoose');
const moment = require("moment");
const chalk = require("chalk");

const bot = new Discord.Client();

//Not found in GitHub
let secrets = require("./secrets.json");

bot.prefix = "?";
bot.ownerID = `${secrets.ownerID}`;
bot.status = "Offline (Maintainance)"
bot.commands = new Discord.Collection();

mongoose.connect(`mongodb://${secrets.username}:${secrets.password}@ds125341.mlab.com:25341/${secrets.database}`, { useNewUrlParser: true });
var db = mongoose.connection;
let discordUser = require("./models/discordUsers");
let Week = require("./models/usersJoined");

fs.readdir("./commands/", (err, files) => {
    if (err) console.error(err);

    let jsfiles = files.filter(f => f.split(".").pop() === "js");

    if (jsfiles.length <= 0) {
        console.log(chalk.red("No Commands To Load!"));
        return;
    }

    console.log(chalk.blue("Loading ") + chalk.yellow(jsfiles.length) + chalk.blue(" Commands!"));

    jsfiles.forEach((f, i) => {
        let props = require('./commands/' + f);
        console.log(chalk.yellow(`${i + 1}`) + " | " + chalk.cyan("Loading Command: ") + chalk.bgWhite.black(`${props.help.name}`) + chalk.cyan("!"));
        bot.commands.set(props.help.name, props);
    });
});

const serverStats = {
    totalUsersID: '461170920350941184',
    memberCountID: '461170991855304712',
    botCountID: '461171049401417728'
}

bot.login(secrets.token);

bot.on("ready", () => {
    console.log(chalk.magenta("Ready!"));
    bot.user.setActivity(`Listening for ${bot.prefix}help`);
    bot.status = "Online"
});

bot.on("message", message => {
    if (message.channel.type === `dm`) return;
    if (message.author.bot) return;
    if (message.content.startsWith(bot.prefix)) {
        let args = message.content.split(" ");
        command = args[0].slice(1).toLowerCase();
        args = args.slice(1);
        let cmd = bot.commands.get(command);

        if (!cmd) return;

        cmd.run(bot, message, args);
    } else {
        discordUser.findUserByID(message.author.id, function(err, user){
            if (err) throw err;
            if (!user){
                let newUser = new discordUser({
                    userID: message.author.id,
                    currency: 0,
                    lastDaily: "Not Collected",
                    benifits: false
                });

                discordUser.createUser(newUser, function(err, user){
                    if(err) throw err;
                    console.log(user);
                });
            }
        });
    }
});

bot.on("guildMemberAdd", async member => {
    member.guild.channels.get(serverStats.totalUsersID).setName(`Total Users: ${member.guild.memberCount}`);
    member.guild.channels.get(serverStats.memberCountID).setName(`Member Count : ${member.guild.members.filter(m => !m.user.bot).size}`);
    member.guild.channels.get(serverStats.botCountID).setName(`Bot Count : ${member.guild.members.filter(m => m.user.bot).size}`);
    //Week Numbers
    let we = await Week.getD7();
    let currentDay = moment().format("L");
    if(we.number !== currentDay){
        await Week.updateWeek(currentDay);
    }
    await Week.updateDay(true);
});

bot.on("guildMemberRemove", async member => {
    member.guild.channels.get(serverStats.totalUsersID).setName(`Total Users: ${member.guild.memberCount}`);
    member.guild.channels.get(serverStats.memberCountID).setName(`Member Count : ${member.guild.members.filter(m => !m.user.bot).size}`);
    member.guild.channels.get(serverStats.botCountID).setName(`Bot Count : ${member.guild.members.filter(m => m.user.bot).size}`);
    //Week Numbers
    let we = await Week.getD7();
    let currentDay = moment().format("L");
    if (we.number !== currentDay) {
        await Week.updateWeek(currentDay);
    }
    await Week.updateDay(false);
});

//Server

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars').create({ defaultLayout: 'layout', helpers: { json: function (content) { return JSON.stringify(content);}}});
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//Give routes bot var
module.exports.bot = bot;

//Routes
var routes = require('./routes/index');
var account = require('./routes/account');
var accounts = require("./routes/accounts");
var server = require("./routes/server");

// Init App
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs.engine);
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes);
app.use('/account', account);
app.use("/accounts", accounts);
app.use('/server', server);

app.use((err, req, res, next) => {
    switch (err.message) {
        case 'NoCodeProvided':
            return res.status(400).send({
                status: 'ERROR',
                error: err.message,
            });
        default:
            return res.status(500).send({
                status: 'ERROR',
                error: err.message,
            });
    }
});

//404 Middleware
app.use((req, res) => {
    res.status(404);
    res.render("404");
})

// Set Port
app.set('port', (process.env.PORT || 6000));

app.listen(app.get('port'), function () {
    console.log('Server started on port ' + app.get('port'));
});

module.exports.app = app;
