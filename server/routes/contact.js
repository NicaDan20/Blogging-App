const express = require('express')
const router = express()
const fetchPage = require("../middleware/middleware.js");
const { Contact } = require('../models/contact.js')
let Recaptcha = require('express-recaptcha').RecaptchaV2
const Isemail = require('isemail')
const parsePhoneNumber = require('libphonenumber-js')
const SITE_KEY = '6LdySfAUAAAAAF83Z7rVM4XOSHeWQU-mVUw9pagR'
const SECRET_KEY = '6LdySfAUAAAAAB_47xR5suQcFlEoVIUe2bZmLv5O'

let recaptcha = new Recaptcha(SITE_KEY, SECRET_KEY)

router.use(fetchPage.fetchPage);


router.get("/", recaptcha.middleware.render, (req, res) => {
    res.render("contact", {
        recaptcha: res.recaptcha,
        contact: new Contact()
    })
}
)

router.post('/', recaptcha.middleware.verify, async function (req, res) {
    let contact = new Contact({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        subject: req.body.subject,
        messageUnsanitized: req.body.message
    })
    if (!req.recaptcha.error) {
        //success code
        // validate email and phone numbers if applicable
        validateContact(contact, res)
    }
    else {
        // failure code
        res.render("contact", {
            recaptcha: recaptcha.render(),
            contact: contact,
            recaptchaMsg: "Please complete the reCaptcha to submit your message!"
        })

    }
})

// info@dbcindy.com
// mail.dbcindy@gmail.com


function validateEmail(email) {

    return Isemail.validate(email)
}

function validatePhone(phoneNumber) {
    try {
        return parsePhoneNumber.isValidNumber(phoneNumber, 'US')
    } catch (err) {
        console.log(err)
        return false
    }
}

function validateContact(contact, res) {
    if (!validateEmail(contact.email)) { 
        if (!validatePhone(contact.phone)) { //if both email and phone number are invalid
            res.render("contact", {
                recaptcha: recaptcha.render(),
                contact: contact,
                emailErrorMsg: "Please insert a valid email address",
                phoneNumberErrorMsg: "Please insert a valid phone number"
            })
        } else { // if phone number is valid but email address is not valid
            res.render("contact", {
                recaptcha: recaptcha.render(),
                contact: contact,
                emailErrorMsg: "Please insert a valid email address"
            })
        }
    } else { // if email address is valid
        if (!validatePhone(contact.phone)) { // but phone number is not 
            res.render("contact", {
                recaptcha: recaptcha.render(),
                contact: contact,
                phoneNumberErrorMsg: "Please insert a valid phone number"
            })
        } else { // if everything is valid
            contact.save()
            res.render("contact", {
                recaptcha: recaptcha.render(),
                contact: new Contact(),
                successMsg: "Thank you for contacting us. We will reply as soon as possible"
            })
        }
    }
}

module.exports = router