import JWT from 'jsonwebtoken'

const generateToken = async (userInfo, secretSignature, tokenLife) => {
  return JWT.sign(userInfo, secretSignature, {
    algorithm: 'HS256',
    expiresIn: tokenLife
  })
}

const verifyToken = async (token, secretSignature) => {
  return JWT.verify(token, secretSignature)
}

export const jwtProvider = {
  generateToken,
  verifyToken
}
