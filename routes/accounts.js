let express = require("express");
let router = express.Router();

let User = require('../models/user');

router.get("/", async function(req, res){
    let users;
    await User.find({}, function(err, user){
        users = user;
    });

    res.render("accountsMain", {users: users});
});

router.get("/:username", function(req, res){
    let username = req.params.username;

    User.getUserByUsername(username, function(err, user){
        if (err) throw err;
        if (!user){
            req.flash("error_msg", "User Not Found");
            res.redirect("/");
        } else {
            res.render("accounts", {
                user: user
            });
        }
    });
});

module.exports = router;