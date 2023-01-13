const express = require('express')
const config = require('config')
const logger = require('./startup/logger')

const app = express()

require('./startup/cors')(app)
require('./startup/db')()
require('./startup/routes')(app)
require('./startup/prod')(app)

const port = process.env.PORT || config.get('port')
const server = app.listen(port, () => {
    logger.info(`Now listening on port ${port}...`)
})

module.exports = server