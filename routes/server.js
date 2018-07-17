let express = require("express");
let bot = require("../app");
let router = express.Router();

function handleRedirect(req, res) {
    const targetUrl = "https://discord.gg/WyzYsPe" + req.originalUrl;
    res.redirect(targetUrl);
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in');
        res.redirect('/account/login');
    }
}

router.get("/invite", handleRedirect);

router.get("/user", (req, res) => {
    res.render("user");
});
        
router.post("/user/submit", function (req, res) {
    let id = req.body.id;
    res.redirect("/server/user/" + id);
});

router.get("/user/:id", (req, res) => {
    let user = bot.guilds.get("461165458049990666").members.get(req.params.id);
    let r = bot.guilds.get("461165458049990666").roles.find("name", "Staff");
    let staff;
    if (user) {
        let role = user.highestRole.name;
        if (user.roles.has(r.id)) staff = "Is a staff member.";
        else staff = "Is not a staff member."
        res.render("userPage", {
            user: user.user.username,
            role: role,
            staff: staff
        });
    } else {
        req.flash("error_msg", "User not found by ID of " + req.params.id);
        res.redirect("/server/user");
    }
});

router.get("/user/kick/:id", ensureAuthenticated, function(req, res){
    if(!req.user.admin){
        res.sendStatus(404).render("404");
    } else {
        res.render("kick", {id: req.params.id});
    }
});

router.post("/user/kick/:id/approved", ensureAuthenticated, function (req, res) {
    if (!req.user.admin) {
        res.sendStatus(404).render("404");
    } else {
        if (!req.params.id) {
            req.flash("error_msg", "Please supply a user id")
            res.redirect("/server/user")
            return
        }

        if (!req.body || !req.body.approved || req.body.approved.toLowerCase() !== "approved"){
            req.flash("error_msg", "Please approve of this action")
            res.redirect("/server/user/kick/" + req.params.id)
            return;        }

        let highestRole = bot.guilds.get("461165458049990666").members.get(req.params.id).highestRole.position;
        let my = bot.guilds.get("461165458049990666").members.get(bot.user.id).highestRole.position;

        if(highestRole > my){
            req.flash("error_msg", "They are a higher position than my bot!\nIt cannot kick them.");
            res.redirect("/server/user/kick/" + req.params.id);
            return;
        }

        bot.guilds.get("461165458049990666").member(req.params.id).kick();
        res.redirect("/account/admin");
    }
});

router.get("/user/ban/:id", ensureAuthenticated, function (req, res) {
    if (!req.user.admin) {
        res.sendStatus(404).render("404");
    } else {
        res.render("ban", { id: req.params.id });
    }
});

router.post("/user/ban/:id/approved", ensureAuthenticated, function (req, res) {
    if (!req.user.admin) {
        res.sendStatus(404).render("404");
    } else {
        if (!req.params.id) {
            req.flash("error_msg", "Please supply a user id")
            res.redirect("/server/user")
            return;
        }

        if (!req.body || !req.body.approved || req.body.approved.toLowerCase() !== "approved") {
            req.flash("error_msg", "Please approve of this action")
            res.redirect("/server/user/ban/" + req.params.id)
            return;
        }

        let highestRole = bot.guilds.get("461165458049990666").members.get(req.params.id).highestRole.position;
        let my = bot.guilds.get("461165458049990666").members.get(bot.user.id).highestRole.position;

        if (highestRole > my) {
            req.flash("error_msg", "They are a higher position than my bot!\nIt cannot ban them.");
            res.redirect("/server/user/ban/" + req.params.id);
            return;
        }

        bot.guilds.get("461165458049990666").member(req.params.id).ban();
        res.redirect("/account/admin");
    }
});

module.exports = router;