const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: { // hash
        type: String,
        required: true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId, ref:'Role'
}
    
})

userSchema.pre('validate', async function(next) {
    // set role to newly registered user (DEFAULT - USER)
    if (!this.role) {
        let role = await Role.findOne({name: 'User'})
        this.role = role
        console.log("Hello my new "+ role)        
    }

    if (this.password) {
        hash = await bcrypt.hash(this.password, 10)
        this.password = hash
    }


    next()
})

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    permissions: [{type: mongoose.Schema.Types.ObjectId, ref:'Permission'}]
})

const permissionSchema = new mongoose.Schema({
    
    // current permissions - CanCreateArticle -- CanEditArticle -- CanDeleteArticle -- CanSetUserRoles

    name: {
        type: String,
        required: true,
        unique: true
    }
})

const User = mongoose.model('User', userSchema)
const Role = mongoose.model('Role', roleSchema)
const Permission = mongoose.model('Permission', permissionSchema)

module.exports = {User, Role, Permission}

