const rateLimiter = require('express-rate-limit')

const apiLimiter = rateLimiter({

    windowMs: 15*60*1000,
    max: 10,
    message: {

        msg: 'Too many requests from this IP, please try again after 15 minutes'
    }
})

module.exports = apiLimiter