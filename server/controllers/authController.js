import { User } from '../models/User.js'
import { generateToken, clearToken } from '../middleware/authMiddleware.js'

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, currency, timezone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const userExists = await User.findOne({ email: normalizedEmail })
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      })
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      currency: currency || 'INR',
      timezone: timezone || 'Asia/Kolkata',
    })

    generateToken(res, user._id)

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        timezone: user.timezone,
        theme: user.theme || 'dark',
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    generateToken(res, user._id)

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        timezone: user.timezone,
        theme: user.theme || 'dark',
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  clearToken(res)
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  })
}

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        timezone: user.timezone,
        theme: user.theme || 'dark',
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update user profile & preferences
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const { name, currency, timezone, theme, currentPassword, newPassword } = req.body

    if (name) user.name = name.trim()
    if (currency) user.currency = currency
    if (timezone) user.timezone = timezone
    if (theme && ['dark', 'light'].includes(theme)) user.theme = theme

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password',
        })
      }
      const isMatch = await user.matchPassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match',
        })
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        })
      }
      user.password = newPassword
    }

    const updatedUser = await user.save()

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        currency: updatedUser.currency,
        timezone: updatedUser.timezone,
        theme: updatedUser.theme || 'dark',
        createdAt: updatedUser.createdAt,
      },
    })
  } catch (error) {
    next(error)
  }
}
