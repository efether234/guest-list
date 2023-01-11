const auth = require('../middleware/auth')
const bcrypt = require('bcrypt')
const _ = require('lodash')
const { User } = require('../models/user')
const express = require('express')
const router = express.Router()

const logger = require('../startup/logger')

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password')
    res.send(user)
})

router.post('/', async (req, res) => {
    logger.info('POST /api/users')
    let user = await User.findOne({ username: req.body.username })
    if (user) return res.status(400).send('User already registered')

    user = new User(_.pick(req.body, ['username', 'password']))
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
    await user.save()

    const token = user.generateAuthToken()
    res
        .header('X-Auth-Token', token)
        .send(_.pick(user, ['_id', 'username']))
})

module.exports = router