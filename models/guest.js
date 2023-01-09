const mongoose = require('mongoose')

const guestSchema = new mongoose.Schema({
    lastName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: String
    },
    otherNames: String,
    email: {
        type: String,
        minlength: 5,
        maxlength: 256,
        unique: true
    },
    attending: {
        type: Boolean,
        required: true,
        default: false
    },
    pluses: {
        type: Number,
        required: true,
        default: 0,
        max: {
            type: Number,
            required: true,
            default: 0
        }
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
        ref: 'User', // TODO
        required: true
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },
    dateModified: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports.Guest = new mongoose.model('Guest', guestSchema)