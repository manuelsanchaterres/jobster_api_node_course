const { BadRequestError } = require("../errors")

const testuser = (req, res, next) => {

    if (req.user.testUser) {

        throw new BadRequestError(`Test User cannot perform database Create, Update or Delete Operations`)

    }

    next()
}

module.exports = testuser