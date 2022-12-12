const Blog = require ("../models/blog.js")

async function fetchPage (req, res, next) {
    let fs = require("fs")
    if (req.params.page == "home" || req.params.page == "index" || req.params.page == undefined)
    {
        page = "index"
    }
    else {
        page = req.params.page
    }
    fs.readFile(`./views/${page}.html`, 'utf-8', (err, data) => {
        if (err) {
            res.locals.error = true
        }
        else
            res.locals.data = data;
        
        next ()})
}

function fetchArticles (key, value) {
    return async (req, res, next) => {
        try {
            query = {}
            query[key] = eval(value)
            console.log(query)
            const itemsPerPage = 6
            const page = parseInt(req.params.page)
            const fetchedArticles = await Blog.find(query).sort({createdAt: -1}).limit(itemsPerPage).skip(((page -1)* itemsPerPage))
            req.articles = fetchedArticles
            req.page = page
            size = await Blog.count()
            req.totalPages = Math.ceil(size/itemsPerPage)
            next()
        } catch (e) {
            console.log(e)
            res.redirect('/')
        }
    }
} 

function generatePagesList (req, res, next) {
    let pageList = []
    if (req.totalPages <= 2) {
                 for (i=1;i<=req.totalPages;i++) {
                     pageList.push(i)
                 }
             }
             else {
                 let validIterations = 1
                 let j = req.page-2
                 if (req.page > 3) {
                    pageList.push(1)
                 }
                 while (validIterations <= 5 && j <= req.totalPages) {
                     if (j > 0) {
                         pageList.push(j)
                         validIterations++
                         j++
                     }
                     else {
                         j++
                     }
                 }
                 if (validIterations == 6) {
                     let validate = true
                     let x = 1;
                      while (validate == true) {
                      let farPage = Math.ceil(pageList[pageList.length-1]/10)*x*10
                      if (req.totalPages > farPage && x < 4) {
                         if (pageList.includes(farPage)) {
                             x++
                         }
                         else {
                             pageList.push(farPage)
                             x++
                         }
                      }
                      else {
                          validate = false
                      }
                 }
                 if (!pageList.includes(req.totalPages)) {
                     pageList.push(req.totalPages)
                 }
                 }
             }
        
        
             req.pageList = pageList
             next()

}

async function getRecentPosts (req, res, next) {
    let recentPostsLeft = await Blog.find().sort({ createdAt:-1 }).limit(2)
    let recentPostsRight = await Blog.find().sort({ createdAt:-1 }).limit(2).skip(2)
    req.recentPostsLeft = recentPostsLeft
    req.recentPostsRight = recentPostsRight
    next()
}

async function getRecentPostsFooter (req, res, next) {
    recentPosts = await Blog.find({}, { title: 1, createdAt: 1, slug: 1, _id: 0}).sort({ createdAt:-1 }).limit(3)
    req.recentPosts = recentPosts
    next()
}

function checkPerms (req, res, next) {
    req.perms = []
    if (req.user) {
        req.perms = req.user.perms
    }
    next()
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
    return next()
    }
 
    res.redirect("/auth/login")
 }
 
 function checkNotAuthenticated(req, res, next) {
     if (req.isAuthenticated()) {
     return res.redirect("/blog")
     }
  
     next()
 }

function ensureAuthenticated(req, res, next) {
    if (req.session.passport) {
        res.locals.login = req.session.passport
    } else {
        res.locals.login = ""
    }
    next ()
}

module.exports = {fetchPage, generatePagesList, getRecentPosts, checkPerms, checkAuthenticated, checkNotAuthenticated, getRecentPostsFooter, ensureAuthenticated, fetchArticles}