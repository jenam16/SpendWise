import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

export const generateToken = (res, userId) => {
  const secret = process.env.JWT_SECRET || 'spendwise_default_jwt_secret_dev_2026'
  const token = jwt.sign({ userId }, secret, {
    expiresIn: '30d',
  })

  res.cookie('spendwise_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  })

  return token
}

export const clearToken = (res) => {
  res.cookie('spendwise_token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.spendwise_token

    // Also support Bearer token in Authorization header for API testing/tools
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      })
    }

    const secret = process.env.JWT_SECRET || 'spendwise_default_jwt_secret_dev_2026'
    const decoded = jwt.verify(token, secret)

    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists',
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid or expired',
    })
  }
}
