const mongoose = require('mongoose')
const { marked } = require('marked')
const { JSDOM } = require('jsdom')
const createDomPurify = require('dompurify')
const domPurify = createDomPurify(new JSDOM().window)
const nodemailer = require('nodemailer')

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    },
    subject: {
        type: String,
        required: true
    },
    messageUnsanitized: {
        type: String,
        required: true
    },
    messageSanitized: {
        type: String,
        required: true
    }

})

contactSchema.pre('validate', function (next) {
    if (!this.messageSanitized) {
        this.messageSanitized = domPurify.sanitize(marked(this.messageUnsanitized))
    }

    if (!this.phone) {
        this.phone = ""
    }

    next()
})

contactSchema.pre('save', async function(next) {
    console.log("Saving")
    await sendEmail(this)
    next()
})

function sendEmail(contact) {
    console.log("Email sending!")
    let transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true,
        tls: {
            rejectUnauthorized: true,
            minVersion: "TLSv1.2"
        },
        auth: {
            user: "mail.dbcindy@gmail.com",
            pass: "mzulnimnodgadopr"
        }
    })

    const options = {
        from: contact.email,
        to: "danut.nica@gmail.com",
        replyTo: contact.email,
        subject: contact.subject,
        html: `<p>Hello!</p> <p>${contact.name} (${contact.email}) with Phone Number ${contact.phone} has sent you the following message </p> ${contact.messageSanitized}`
    }

    transporter.sendMail(options, function (err, info) {
        if (err) {
            console.log(err)
            return
        }
        console.log(info.response)
    }
    )

    console.log("Email sent!")

}

const Contact = mongoose.model('Contact', contactSchema)

module.exports = { Contact }
