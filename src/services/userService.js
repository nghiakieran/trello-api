import bcryptjs from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'

import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { pickUser } from '~/utils/formatters'
import { sendVerifyEmail } from '~/utils/email'

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
    password: bcryptjs.hashSync(reqBody.password, 8),
    username: nameFromEmail,
    displayName: nameFromEmail,
    verifyToken: uuidv4()
  }

  const createdUser = await userModel.createNew(newUser)
  const getNewUser = await userModel.findOneById(createdUser.insertedId)

  await sendVerifyEmail(getNewUser.email, getNewUser.verifyToken)

  return pickUser(getNewUser)
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
  deleteOneById
}
