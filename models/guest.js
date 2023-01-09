const mongoose = require('mongoose')
const { User } = require('../models/user')

const guestSchema = new mongoose.Schema({
    lastName: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: String
    },
    otherNames: [String],
    email: {
        type: String,
        sparse: true,
        unique: true
    },
    attending: {
        type: Boolean,
        required: true,
        default: false
    },
    maxPlusses: {
        type: Number,
        required: true,
        default: 0
    },
    plusses: {
        type: Number,
        required: true,
        default: 0,
        max: 10 // TODO:
    },
    dietaryRestrictions: {
        type: String,
        max: 500
    },
    karaokeSong: {
        type: String,
        max: 50
    },
    addedBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true,
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now(),
        immutable: true
    },
    dateModified: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

module.exports.Guest = new mongoose.model('Guest', guestSchema)