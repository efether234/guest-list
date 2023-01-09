const config = require('config')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({
        _id: this._id
    },
    config.get('jwtPrivateKey'))
}

module.exports.User = new mongoose.model('User', userSchema)