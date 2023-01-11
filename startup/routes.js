const express = require('express')
const guests = require('../routes/guests')
const users = require('../routes/users')
const auth = require('../routes/auth')

module.exports = function(app) {
    app.use(express.json())
    app.use('/api/guests', guests)
    app.use('/api/users', users)
    app.use('/api/auth', auth)
}