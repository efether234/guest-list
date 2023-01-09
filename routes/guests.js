const { Guest } = require('../models/guest')
const auth = require('../middleware/auth')
const express = require('express')
const logger = require('../startup/logger')

const router = express.Router()

router.get('/', auth, async (req, res) => {
    logger.info('GET /api/guests/')
    const guests = await Guest.find()
        .select('-__v')
        .sort('lastName')
    res.send(guests)
})

router.post('/', async (req, res) => {
    if (!req.body.lastName || !req.body.firstName) return res.status(400).send('Names required')

    const guest = new Guest({
        lastName: req.body.lastName,
        firstName: req.body.firstName,
        otherNames: req.body.otherNames,
        maxPluses: req.body.maxPlusses
    })

    await guest.save()

    res.send(guest)
})

router.put('/:id', async (req, res) => {
    const guest = await Guest.findByIdAndUpdate(
        req.params.id,
        {
            lastName: req.body.lastName,
            firstName: req.body.firstName,
            otherNames: req.body.otherNames,
            maxPlusses: req.body.maxPlusses
        },
        { new: true }
    )

    if (!guest) return res.status(404).send('Guest not found')

    res.send(guest)
})

router.delete('/:id', async (req, res) => {
    const guest = await Guest.findByIdAndRemove(req.params.id);

    if (!guest) return res.status(404).send('Guest not found')

    res.send(guest)
})

module.exports = router