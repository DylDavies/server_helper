let Discord = require("discord.js");
let datab = require("quick.db");
let User = require("../models/user");
const moment = require("moment")
require("moment-duration-format");
let bot = require("../app").bot;
var express = require('express');
var router = express.Router();

datab.fetchObject("teams_total").then(async teams => {
    let total;
    if (!teams.text) total = `0`;
    else total = `${teams.text}`

    router.get("/", (req, res) => {
        res.render("index", {
            title: "XLR8 Official",
            status: bot.status,
            uptime: moment.duration(bot.uptime).format(" D [days], H [hrs], m [mins], s [secs]"),
            total: total
        });
    });
});

module.exports = router;
