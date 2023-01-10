const express = require('express')
const guests = require('../guests')

module.exports = function(app) {
    app.use(express.json())
    app.use('/api/guests', guests)
}