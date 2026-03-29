import bcryptjs from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'

import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { pickUser } from '~/utils/formatters'

const createNew = async (reqBody) => {
  const existUser = await userModel.findOneByEmail(reqBody.email)

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

  //  TODO: Send verify email to user

  const createdUser = await userModel.createNew(newUser)
  const getNewUser = await userModel.findOneById(createdUser.insertedId)

  return pickUser(getNewUser)
}

export const userService = {
  createNew
}
