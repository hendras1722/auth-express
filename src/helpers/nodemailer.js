const nodemailer = require('nodemailer')

require('dotenv').config()
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS_EMAIL,
  },
})
module.exports = { transporter }
