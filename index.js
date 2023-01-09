const express = require('express')

const app = express()

require('./startup/db')()
require('./startup/routes')()

const port = 80
const server = app.listen(port, () => {
    console.log(`Now listening on port ${port}`)
})

module.exports = server