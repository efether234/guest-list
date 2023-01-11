const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function(req, res, next) {
    if(!config.get('requiresAuth')) return next();
    const token = req.header('X-Auth-Token')
    if (!token) return res.status(401).send('Access denied.')

    try {
        req.user = jwt.verify(token, config.get('jwtPrivateKey'))
        next()
    } catch {
        res.status(400).send('Invalid token.')
    }
}