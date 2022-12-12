const express = require('express')
const router = express()
const {User} = require('./../models/user')
const Blog = require('./../models/blog')
const middleware = require("../middleware/middleware.js");
const { parseTitle } = require("./../customfunc/stringfunc.js");
const imageTypes = ['image/jpeg', 'image/png', 'images/gif']
const {fetchArticles} = require("../middleware/middleware.js");
const { query } = require('express');

router.use(middleware.fetchPage);

router.get("/", fetchArticles('', ''), middleware.generatePagesList, middleware.checkPerms, async (req, res) => {
    res.redirect("/blog/page=1")
})

router.get("/page=:page", fetchArticles('',''), middleware.generatePagesList, middleware.ensureAuthenticated, middleware.checkPerms, async (req, res) => {
    perms = req.perms
    totalPages = req.totalPages
    currentPage = req.page
    let articles = req.articles
    let pageList = req.pageList
    res.render("blog", {
        _title_: "DeepBlueComputers - Blog Page",
        articles: articles,
        pageList : pageList
    })
})

router.get("/tags/:tag", fetchArticles('tags', 'req.params.tag'), middleware.generatePagesList, middleware.checkPerms, async (req, res) => {
    perms = req.perms
    role = req.role
    totalPages = req.totalPages
    currentPage = req.page
    let articles = req.articles
    let pageList = req.pageList
    let tag = req.params.tag
    res.render("blog", {
        _title_: "DeepBlueComputers - Blog Page",
        articles: articles,
        pageList : pageList,
        tag: tag
    })
}) 

router.get("/new", middleware.checkAuthenticated, middleware.checkPerms, (req, res) => {
    if (req.perms.includes("CanCreateArticle")){
        res.render("blog/new", {blogPost: new Blog() })
    }
    else {
        res.redirect("/blog/page=1")
    }
})

router.get("/read/:slug", middleware.getRecentPosts, async (req, res) => {
    const blogPost = await Blog.findOne({ slug: req.params.slug})
    if (blogPost == null) {
        res.redirect('/blog')
    }
    else {
        res.render('blog/show', {
            _title_: `DeepBlueComputers - ${parseTitle(blogPost.title)}`,
            blogPost: blogPost,
            recentPostsLeft: req.recentPostsLeft,
            recentPostsRight: req.recentPostsRight})        
    }
})

router.post("/new", middleware.checkAuthenticated, middleware.checkPerms, middleware.checkPerms, async (req, res) => {
    if (req.perms.includes("CanCreateArticle")) {
        let blogPost = new Blog ({
            title: req.body.title,
            subtitle: req.body.subtitle,
            description: req.body.description,
            markdown: req.body.markdown,
            author: req.user.username,
            tagText: req.body.tagText
        })
        saveImage(blogPost, req.body.cover)
        try {
            blogPost = await blogPost.save()
            res.redirect(`read/${blogPost.slug}`)
        }
        catch (e) {
            res.render('blog/new', { blogPost: blogPost})
            console.log("The error is ---- " + e)
            console.log("/n")
        }    
    }
    else {
        res.redirect("/blog/page=1")
    }
    
})

router.get("/edit/:id", middleware.checkAuthenticated, middleware.checkPerms, async (req, res) => {
    if (req.perms.includes("CanEditArticle")) {
        const blogPost = await Blog.findOne( {_id: req.params.id} )
    if (blogPost == null) {
        res.redirect('/blog')
    }
    else {
        res.render('blog/edit', {
            _title: `Edit Article - ${parseTitle(blogPost.title)}`,
            blogPost : blogPost
        })
    }
    } else {
        res.redirect("/blog/page=1")
    }
})

router.post("/edit/:id", middleware.checkAuthenticated, middleware.checkPerms, async (req, res) => {
    if (req.perms.includes("CanEditArticle")) {
        let blogPost = await Blog.findOne ({ _id: req.params.id })
        blogPost.title = req.body.title
        blogPost.subtitle = req.body.subtitle
        blogPost.description = req.body.description
        blogPost.markdown = req.body.markdown
        blogPost.tagText = req.body.tagText
        if (req.body.cover != null && req.body.cover !== '') {
            saveImage(blogPost, req.body.cover)
        }
        try {
            await blogPost.save();
            res.redirect(`/blog/read/${blogPost.slug}`)
        }
        catch {
            res.render('blog/edit', {
                _title: `Edit Article - ${parseTitle(blogPost.title)}`,
                blogPost : blogPost
            })
        }
    } else {
        res.redirect("/blog/page=1")
    }
    

    })

router.post("/delete/:id", middleware.checkAuthenticated, middleware.checkPerms, async (req, res) => {
    if (req.perms.includes(CanDeleteArticle)) {
        await Blog.findByIdAndDelete({ _id: req.params.id })
        res.redirect("/blog")    
    } else {
        res.redirect("/blog/page=1")
    }
})

function saveImage (blogPost, encodedImage) {
    if (encodedImage == null ) return
    const image = JSON.parse(encodedImage)
    if (image != null && imageTypes.includes(image.type)) {
        blogPost.coverImage = new Buffer.from(image.data, 'base64')
        blogPost.coverImageType = image.type
    }
}

module.exports = router