const { Guest } = require('../../models/guest')
const auth = require('../middleware/auth')
const express = require('express')
const logger = require('../../startup/logger')

const router = express.Router()

router.get('/', auth, async (req, res) => {
    logger.info('GET /api/guests/')
    const guests = await Guest.find()
        .select('-__v')
        .sort('lastName')
    res.send(guests)
})

router.post('/', auth, async (req, res) => {
    logger.info('POST /api/guests/')
    if (!req.body.lastName || !req.body.firstName) return res.status(400).send('Names required')

    const guest = new Guest({
        lastName: req.body.lastName,
        firstName: req.body.firstName,
        otherNames: req.body.otherNames,
        maxPluses: req.body.maxPlusses,
        addedBy: req.user
    })

    await guest.save()

    res.send(guest)
})

router.post('/search', async (req, res) => {
    logger.info('POST /api/guests/search')

    lastName = req.body.lastName
    firstName = req.body.firstName === '' ? '.*' : new RegExp(req.body.firstName)

    const guests = await Guest.find({
        $and: [
            { lastName: lastName },
            { $or: [
                {
                    firstName: {
                        $regex: firstName,
                        $options: 'i'
                    }
                },
                {
                    otherNames: {
                        $regex: firstName,
                        $options: 'i'
                    }
                }
            ]}
        ]
    })

    res.send(guests)
})

router.put('/:id', auth, async (req, res) => {
    logger.info('PUT /api/guests/id')
    const guest = await Guest.findByIdAndUpdate(
        req.params.id,
        {
            lastName: req.body.lastName,
            firstName: req.body.firstName,
            otherNames: req.body.otherNames,
            email: req.body.email,
            attending: req.body.attending,
            maxPlusses: req.body.maxPlusses,
            plusses: req.body.plusses,
            dietaryRestrictions: req.body.dietaryRestrictions,
            karaokeSong: req.body.karaokeSong,
            dateModified: Date.now()
        },
        { new: true }
    )

    if (!guest) return res.status(404).send('Guest not found')

    res.send(guest)
})

router.put('/:id/rsvp', async (req, res) => {
    logger.info('PUT /api/guests/rsvp/id')

    const guest = await Guest.findById(req.params.id)

    if (!guest) return res.status(400).send('No guest found')

    guest.email = req.body.email
    guest.attending = req.body.attending
    guest.plusses = req.body.plusses
    guest.dietaryRestrictions = req.body.dietaryRestrictions
    guest.karaokeSong = req.body.karaokeSong
    guest.save()

    res.send(guest)
})

router.delete('/:id', auth, async (req, res) => {
    logger.info('DELETE /api/guests/id')
    const guest = await Guest.findByIdAndRemove(req.params.id).select('-__v')

    if (!guest) return res.status(404).send('Guest not found')

    res.send(guest)
})

module.exports = router