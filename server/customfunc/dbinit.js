const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const { Permission } = require('../models/user')
const { Role } = require('../models/user')
const { User } = require('../models/user')

const uri = 'mongodb://127.0.0.1:27017/dbcindydb'
mongoose.connect(uri)

let connection = mongoose.connection

connection.once('open', function () {
    connection.db.collection('permissions').count(async function (err, count) {
        if (count == 0) {
            let perms = [{
                name: 'CanCreateArticle'
            }, {
                name: 'CanEditArticle'
            }, {
                name: 'CanDeleteArticle'
            }, {
                name: 'CanSetUserRoles'
            }]
            await Permission.insertMany(perms).then(function (docs) {
            }).catch(function (err) {
                console.log(err)
            })
        }
        else {
            console.log("Found some records")
        }
    })
    connection.db.collection('roles').count(async function (err, count) {
        if (count == 0) {
            let role = [{
                name: 'Administrator',
                permissions: await Permission.find()
            }, {
                name: 'Editor',
                permissions: await Permission.find({ name: { $ne: 'CanSetUserRoles' } })
            }, {
                name: 'User'
            }]
            Role.insertMany(role).then(function (docs) {
            }).catch(function (err) {
                console.log(err)
            })
        }
    })

    connection.db.collection('users').count(function (err, count) {
        if (count == 0) {
            try {
                setTimeout(async function () {
                    let admin = new User({
                        username: 'DBCAdmin',
                        email: 'mail.dbcindy@gmail.com',
                        password: '2b$10$kcrqFNMd8OQ9ZgSZdLJ09ut9ElRdDHOCYTGUV6atQby8xvV7yJbim', // 29D3epKc7Comx2L
                        role: await Role.findOne({name: 'Administrator'})
                    })
                    await admin.save()
                }, 2000)
            } catch (err) { " This is the error: " + console.log(err) }
        }
    })
})

const store = new MongoDBStore({
    uri: uri,
    collection: 'sessions'
})

store.on('error', function (error) {
    console.log(error)
})

