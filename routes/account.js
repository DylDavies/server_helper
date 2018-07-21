var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
const btoa = require('btoa');
const { catchAsync } = require('../utils');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const http = require("http");

var User = require('../models/user');
let Week = require("../models/usersJoined");
let bot = require("../app").bot;

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in');
        res.redirect('/account/login');
    }
}

//Account Page
router.get('/',ensureAuthenticated ,function(req, res){
    res.render("account", {
        user: req.user
    });
});

//Save Account Changes
router.post('/', ensureAuthenticated, function(req, res){
    var oldUsername = req.user.username
    var newUsername = req.body.username;
    var oldEmail = req.user.email;
    var newEmail = req.body.email;
    var oldBio = req.user.bio;
    var newBio = req.body.bio;

    if(oldUsername !== newUsername){
        User.editUser(oldUsername, "username", newUsername);
    }

    if(oldEmail !== newEmail){
        User.editUser(oldUsername, "email", newEmail);
    }

    if(oldBio !== newBio && newBio.toLowerCase() !== "no"){
        User.editUser(oldUsername, "bio", newBio);
    }

    res.redirect("/account/logout");
});

// Register
router.get('/register', function (req, res) {
    res.render('register');
});

// Login
router.get('/login', function (req, res) {
    res.render('login');
});

// Register User
router.post('/register', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        //checking for email and username are already taken
        User.findOne({
            username: {
                "$regex": "^" + username + "\\b", "$options": "i"
            }
        }, function (err, user) {
            User.findOne({
                email: {
                    "$regex": "^" + email + "\\b", "$options": "i"
                }
            }, function (err, mail) {
                if (user || mail) {
                    res.render('register', {
                        user: user,
                        mail: mail
                    });
                } else {
                    var newUser = new User({
                        name: name,
                        email: email,
                        username: username,
                        password: password
                    });

                    User.createUser(newUser, function (err, user) {
                        if (err) throw err;
                        console.log(user);
                    });
                    req.flash('success_msg', 'You are registered and can now login');
                    res.redirect('/account/login');
                }
            });
        });
    }
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: 'Unknown User' });
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid password' });
                }
            });
        });
    }));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/account/login', failureFlash: true }),
    function (req, res) {
        res.redirect('/');
    });

router.get('/logout', function (req, res) {
    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/account/login');
});

let admins = ["TheeSniper95", "Raiinbow"];

router.get("/admin"/*, ensureAuthenticated*/, async function(req, res){
    let we = await Week.fetchWeek();
    let json;

    await Promise.resolve(we).then(result => {
        json = result;
    })

    let members = bot.guilds.get("461165458049990666").members.filter(m => !m.user.bot).size;
    let goal = 250;
    let percent = (members / goal) * 100;

    let users = bot.guilds.get("461165458049990666").members.filter(m => !m.user.bot);
    users = users.array();

    let bots = bot.guilds.get("461165458049990666").members.filter(m => m.user.bot);
    bots = bots.array();

    if(!req.user.admin){
         res.render("404").sendStatus(404);
    }

    if(req.user.admin){
        res.render("admin", {
            admins: admins,
            percent: percent,
            goal: goal,
            users: users,
            bots: bots,
            members: members,
            we: json,
            layout: false
        });
    }
});

router.post("/admin/add", function(req, res){
    if(!req.body.username){
        req.flash("error_msg", "Username Not Provided");
        res.redirect("/account/admin");
        return;
    }

    if (!req.body.password) {
        req.flash("error_msg", "Username Not Provided");
        res.redirect("/account/admin");
        return;
    }

    if(req.body.password !== "Dylan1Davies"){
        req.flash("error_msg", "Password does not match");
        res.redirect("/account/admin");
        return;
    }

    User.getUserByUsername(req.body.username, function(err, user){
        if(err) throw err;
        if(!user){
            req.flash("error_msg", "User not found");
            res.redirect("/account/admin");
            return;
        }
    });

    User.editUser(req.body.username, "admin", true);
    req.flash("success_msg", "Admin Added");
    res.redirect("/account/admin");
});

router.post("/admin/remove", function (req, res) {
    if (!req.body.username) {
        req.flash("error_msg", "Username Not Provided");
        res.redirect("/account/admin");
        return;
    }

    if (!req.body.password) {
        req.flash("error_msg", "Username Not Provided");
        res.redirect("/account/admin");
        return;
    }

    if (req.body.password !== "Dylan1Davies") {
        req.flash("error_msg", "Password does not match");
        res.redirect("/account/admin");
        return;
    }

    User.getUserByUsername(req.body.username, function (err, user) {
        if (err) throw err;
        if (!user) {
            req.flash("error_msg", "User not found");
            res.redirect("/account/admin");
            return;
        }
    });

    User.editUser(req.body.username, "admin", false);
    req.flash("success_msg", "Admin Removed");
    res.redirect("/account/admin");
});

router.get('/discord/done', catchAsync(async (req, res) => {
    if (!req.query.code) throw new Error('NoCodeProvided');

    const redirect = encodeURIComponent("http://localhost:3000/account/discord/done");
    const code = req.query.code;
    const creds = btoa(`464733499073626112:zvQ3LHnQVM4AKP5KXuVeCgupNbroNzb8`);

    const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
        {
            method: 'POST',
            headers: {
                Authorization: `Basic ${creds}`,
            },
        });
    const json = await response.json();
    res.redirect(`/account/discord/oauth2&${json.access_token}&${json.refresh_token}`);
}));

router.get("/discord/oauth2&:access_token&:refresh_token", ensureAuthenticated, async function(req, res){
    let access = req.params.access_token;
    let refresh = req.params.refresh_token;

    if(!access || !refresh){
        return res.redirect("/");
    }

    let request = await fetch("https://discordapp.com/api/users/@me", {
        headers: {
            Authorization: "Bearer " + access,
            "Content-Type": "application/json"
        }
    });

    let json = await request.json();

    User.addDiscord(req.user.username, access, refresh, json.username, json.discriminator, json.id);

    res.redirect("/account");
});;

module.exports = router;
