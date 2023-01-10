const express = require('express')
const guests = require('../routes/guests')

module.exports = function(app) {
    app.use(express.json())
    app.use('/api/guests', guests)
}