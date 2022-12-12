const express = require('express')
const router = express()
const bcrypt = require('bcrypt')
const {User} = require('./../models/user')
const middleware = require("../middleware/middleware.js");
const passport = require('passport')
const LocalStrategy = require('passport-local');
const flash = require('express-flash');

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    try {
        const loggingUser = await User.findOne({ username: username })
        if (!loggingUser) {
            return cb(null, false, { message: "Incorrect credentials!"})
        }
        await bcrypt.compare(password, loggingUser.password, function(err, result) {
            if (err) { return cb(err) }
            if (result) { return cb(null, loggingUser)}
            else {
                return cb(null, false, { message: "Incorrect password"})
            }
        })
    } catch (err) {
        return cb(err)
    }
}))

passport.serializeUser(function (user, cb) {
    process.nextTick(async function() {
        cb(null, {
        id: user._id, 
        username: user.username, 
        perms: await getPerms(user)
    })
    })
})

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user)
    })
})  

router.use(middleware.fetchPage);
router.use(flash())

router.get("/", (req, res) => {
    res.redirect("/auth/login")
})

router.get("/login", middleware.checkNotAuthenticated, (req, res) => {
    res.render("auth/login")
})

router.get("/register", middleware.checkNotAuthenticated, (req, res) => {
    res.render("auth/register")
})

router.post("/register", middleware.checkNotAuthenticated, async (req, res) => {
    let user = new User ({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });
    try {
        user = await user.save()
        res.redirect("login")
    } catch (e) {
        res.redirect("register")
        console.log(e)
    }    
})

router.post("/login", middleware.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/blog',
    failureRedirect: '/auth/login',
    failureFlash: true 
}))

router.post('/logout', function(req, res, next) {
    req.logOut(function(err) {
        if (err) { return next(err) }
        res.redirect('/')
    })
})

async function getPerms (user) {
    let query = await User.findOne({_id: user._id}).populate({path: 'role', populate: {path: 'permissions', select: "name", name: 1}})
    let perms = query.role.permissions.map(function(perm) {
        return perm.name
    })    
    return perms
}

module.exports = router
