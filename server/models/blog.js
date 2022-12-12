const mongoose = require('mongoose')
const slug = require('slugify')
const { marked } = require('marked')
const { default: slugify } = require('slugify')
const { JSDOM } = require('jsdom')
const createDomPurify = require('dompurify')
const domPurify = createDomPurify(new JSDOM().window)

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        type: String,
        default: "DBCIndy"
    },
    coverImage: {
        type: Buffer,
        required: true
    },
    coverImageType: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    sanitizedHTML: {
        type: String,
        required: true
    },
    tagText: {
        type: String
    },
    tags: {
        type: []
    }
})

blogSchema.pre('validate', function(next) {
    if(this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true} )
    }

    if (this.markdown) {
        this.sanitizedHTML = domPurify.sanitize(marked(this.markdown))
    }

    if (this.tagText){
        sanitizedTags = sanitizeTags(this.tagText)
        this.tags = sanitizedTags.split(",")
    }
    
    if (!this.author){
        this.author = "DBCIndy"
    }

    next ()
})

blogSchema.virtual('coverImagePath').get(function() {
    if (this.coverImage != null && this.coverImageType != null) {
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})

function sanitizeTags (tagText) {
    sanitizedTag = tagText.toLowerCase().replace(/\s/g, "-")
    return sanitizedTag
}

module.exports = mongoose.model('Blog', blogSchema)