import bcrypt from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'

import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { pickUser } from '~/utils/formatters'
import { resendProvider } from '~/providers/ResendProvider'
import { jwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

const createNew = async (reqBody) => {
  const existUser = await userModel.findOneByEmail(reqBody.email)
  // eslint-disable-next-line no-console
  console.log(existUser)

  if (existUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
  }

  const nameFromEmail = reqBody.email.split('@')[0]
  const newUser = {
    email: reqBody.email,
    password: bcrypt.hashSync(reqBody.password, 8),
    username: nameFromEmail,
    displayName: nameFromEmail,
    verifyToken: uuidv4()
  }

  const createdUser = await userModel.createNew(newUser)
  const getNewUser = await userModel.findOneById(createdUser.insertedId)

  await resendProvider.sendVerifyEmail(getNewUser.email, getNewUser.verifyToken)

  return pickUser(getNewUser)
}

const verifyAccount = async (reqBody) => {
  const existUser = await userModel.findOneByEmail(reqBody.email)

  if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
  if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!')
  if (reqBody.token !== existUser.verifyToken) {
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')
  }

  const updateData = {
    isActive: true,
    verifyToken: null
  }

  const updatedUser = await userModel.update(existUser._id, updateData)
  return pickUser(updatedUser)
}

const login = async (reqBody) => {
  const existUser = await userModel.findOneByEmail(reqBody.email)

  if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
  if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active')
  if (!bcrypt.compareSync(reqBody.password, existUser.password)) {
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect')
  }

  const userInfo = {
    _id: existUser._id,
    email: existUser.email
  }

  const accessToken = await jwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)
  const refreshToken = await jwtProvider.generateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, env.REFRESH_TOKEN_LIFE)

  return { accessToken, refreshToken, ...pickUser(existUser) }
}

const deleteOneById = async (userId) => {
  const foundUser = await userModel.findOneById(userId)

  if (!foundUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }

  await userModel.deleteOneById(userId)
  return { message: 'User deleted successfully' }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  deleteOneById
}
