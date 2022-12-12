const express = require('express')
const router = express()
const fetchPage = require("../middleware/middleware.js");
const { routes } = require('./contact.js');

router.get("/", (req, res) => {
    res.render("login")
})

router.get("/dashboard", (req, res) => {
    res.render("dashboard")
})

module.exports = router