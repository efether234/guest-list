const express = require('express')

module.exports = function(app) {
    app.use(express.json())
    app.user('/api/guests', require('../routes/guests'))
}