import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { config } from '../config/env.js'
import { User } from '../models/User.js'
import { memoryStore, getDbStatus } from '../config/database.js'
import { ApiResponse } from '../utils/apiResponse.js'

export const authController = {
  /**
   * Login user with credentials
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return ApiResponse.error(res, 'Email and password are required', 400)
      }

      const cleanEmail = String(email).trim().toLowerCase()
      const { isConnected } = getDbStatus()

      let user = null
      if (isConnected) {
        user = await User.findOne({ email: cleanEmail })
      } else {
        user = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail)
      }

      if (!user) {
        return ApiResponse.error(res, 'Invalid email or password', 401)
      }

      if (user.isActive === false) {
        return ApiResponse.error(res, 'Your account has been deactivated. Please contact an administrator.', 403)
      }

      // Check password
      let isValidPassword = false
      if (user.comparePassword) {
        isValidPassword = await user.comparePassword(password)
      } else if (user.passwordHash) {
        isValidPassword = await bcrypt.compare(password, user.passwordHash)
      }

      if (!isValidPassword) {
        return ApiResponse.error(res, 'Invalid email or password', 401)
      }

      const userId = user._id ? user._id.toString() : user.id

      // Generate JWT
      const token = jwt.sign(
        {
          userId,
          email: user.email,
          role: user.role,
          stationId: user.stationId || null,
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn || '7d' },
      )

      // Update last login
      if (isConnected) {
        user.lastLogin = new Date()
        await user.save().catch(() => {})
      } else {
        user.lastLogin = new Date()
      }

      const sanitizedUser = {
        userId,
        name: user.name,
        email: user.email,
        role: user.role,
        stationId: user.stationId || null,
        stationName: user.stationName || null,
      }

      return ApiResponse.success(
        res,
        {
          token,
          user: sanitizedUser,
        },
        'Login successful',
      )
    } catch (err) {
      next(err)
    }
  },

  /**
   * Register new user account
   */
  async register(req, res, next) {
    try {
      const { name, email, password, role, stationId, stationName } = req.body

      if (!name || !email || !password) {
        return ApiResponse.error(res, 'Name, email, and password are required', 400)
      }

      const allowedRoles = ['super_admin', 'station_master', 'cleaning_staff', 'public_user']
      const assignedRole = allowedRoles.includes(role) ? role : 'public_user'

      // Enforce station requirement for Station Master and Cleaning Staff
      if ((assignedRole === 'station_master' || assignedRole === 'cleaning_staff') && !stationId) {
        return ApiResponse.error(
          res,
          `Station selection is required for ${assignedRole === 'station_master' ? 'Station Master' : 'Cleaning Staff'} role`,
          400,
        )
      }

      const cleanEmail = String(email).trim().toLowerCase()
      const cleanStationId = stationId ? String(stationId).trim().toUpperCase() : null
      const { isConnected } = getDbStatus()

      // Check duplicate
      let existing = null
      if (isConnected) {
        existing = await User.findOne({ email: cleanEmail })
      } else {
        existing = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail)
      }

      if (existing) {
        return ApiResponse.error(res, 'An account with this email already exists', 409)
      }

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, salt)

      const newUserObj = {
        name: String(name).trim(),
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
        stationId: cleanStationId,
        stationName: stationName || cleanStationId || null,
        isActive: true,
        lastLogin: new Date(),
      }

      let savedUser = null
      if (isConnected) {
        savedUser = await User.create(newUserObj)
      } else {
        newUserObj._id = `usr_${Date.now()}`
        memoryStore.users.push(newUserObj)
        savedUser = newUserObj
      }

      const userId = savedUser._id.toString()

      // Generate JWT
      const token = jwt.sign(
        {
          userId,
          email: savedUser.email,
          role: savedUser.role,
          stationId: savedUser.stationId,
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn || '7d' },
      )

      const sanitizedUser = {
        userId,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        stationId: savedUser.stationId,
        stationName: savedUser.stationName,
      }

      return ApiResponse.success(
        res,
        {
          token,
          user: sanitizedUser,
        },
        'Account created successfully',
        201,
      )
    } catch (err) {
      next(err)
    }
  },

  /**
   * Get authenticated user profile
   */
  async getCurrentUser(req, res, next) {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Not authenticated', 401)
      }

      return ApiResponse.success(res, req.user, 'Current user profile')
    } catch (err) {
      next(err)
    }
  },
}
