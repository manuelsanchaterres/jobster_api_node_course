const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')

const register = async (req, res) => {

  const user = await User.create({ ...req.body })
  const token = user.createJWT()
  res.status(StatusCodes.CREATED).json({ user: { name: user.name, email: user.email, lastName: user.lastName, location: user.location, token }})

}

const login = async (req, res) => {

  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }
  const user = await User.findOne({ email })
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  // compare password
  const token = user.createJWT()
  res.status(StatusCodes.OK).json({ user: { name: user.name, email: user.email, lastName: user.lastName, location: user.location, token }})
}

const updateUser = async (req,res) => {

  const {user:{userId}, body: {email, lastName, location, name}} = req

  if (!email || !lastName || !location || !name) {

    throw new NotFoundError(`email, lastName, location or name are missing`)

  }

  const updateUser = await User.findOneAndUpdate({_id: userId, ...req.body})

  if (!updateUser) {

    throw new NotFoundError(`User with id ${userId} couldn't be updated`)

  }

  const token = updateUser.createJWT()

  res.status(StatusCodes.OK).json({ user: { name: updateUser.name, email: updateUser.email, lastName: updateUser.lastName, location: updateUser.location, token }})


}

module.exports = {
  register,
  login,
  updateUser
}
