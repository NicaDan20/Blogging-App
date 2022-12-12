const express = require('express')
const app = express()
const ejsLayouts = require("express-ejs-layouts")
const port = 5000;
const passport = require('passport')
const session = require('express-session')
const { parseTitle } = require("./customfunc/stringfunc.js")
const fetchPage = require ("./middleware/middleware.js")
const contactRouter = require("./routes/contact");
const blogRouter = require("./routes/blog");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin")
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const middleware = require('./middleware/middleware.js')
const db = require('./customfunc/dbinit')

app.use(middleware.getRecentPostsFooter)

app.set('view engine', 'ejs')
app.set("views", "./views")
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true, limit: '50mb'}))
//app.use(ejsLayouts)
app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'))
app.use('/blog', express.static(__dirname + '/public'));
app.use('/blog/read', express.static(__dirname + '/public'));
app.use('/blog/page', express.static(__dirname + '/public'));
app.use('/blog/tags', express.static(__dirname + '/public'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: db.store
}))  
app.use(passport.authenticate('session'));



app.use("/contact", contactRouter);
app.use("/blog", blogRouter);
app.use("/hatti", authRouter);
//app.use("/admin_panel", adminRouter);

app.get("/", fetchPage.fetchPage, (req, res) => {
    res.render("main", {
        _title_: `DeepBlueComputers - Computer Experts Noblesville`,
        content: res.locals.data
    })
})

app.get("/:page", fetchPage.fetchPage, async (req, res) => {
    if (res.locals.error == true) {
        res.status(500).send("Server Error!")
    }
    res.render("main", {
        _title_: `DeepBlueComputers - ${parseTitle(req.params.page)}`,
        content: res.locals.data
    })
})

app.listen(port, () => {console.log("Server started on port " + port)})

