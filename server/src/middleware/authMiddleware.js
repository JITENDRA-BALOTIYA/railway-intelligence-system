import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { User } from '../models/User.js'
import { memoryStore, getDbStatus } from '../config/database.js'
import { ApiResponse } from '../utils/apiResponse.js'

/**
 * Middleware to authenticate requests using JWT Bearer token
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Authentication required. Please log in.', 401)
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return ApiResponse.error(res, 'Authentication token missing.', 401)
    }

    let decoded
    try {
      decoded = jwt.verify(token, config.jwtSecret)
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return ApiResponse.error(res, 'Session expired. Please log in again.', 401)
      }
      return ApiResponse.error(res, 'Invalid authentication token.', 401)
    }

    // Lookup user in DB or memoryStore
    const { isConnected } = getDbStatus()
    let user = null

    if (isConnected) {
      user = await User.findById(decoded.userId).lean()
    } else {
      user = memoryStore.users.find(
        (u) => (u._id && u._id.toString() === decoded.userId) || u.email === decoded.email,
      )
    }

    if (!user) {
      return ApiResponse.error(res, 'User account not found or deactivated.', 401)
    }

    if (user.isActive === false) {
      return ApiResponse.error(res, 'User account is inactive. Please contact administrator.', 403)
    }

    // Attach verified user to request
    req.user = {
      userId: user._id ? user._id.toString() : decoded.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      stationId: user.stationId || null,
      stationName: user.stationName || null,
    }

    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Middleware to enforce allowed user roles
 * @param  {...string} allowedRoles (e.g. 'super_admin', 'station_master')
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required.', 401)
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Access denied. Role '${req.user.role}' does not have permission to access this resource.`,
        403,
      )
    }

    next()
  }
}

/**
 * Middleware to enforce station-level scoping for Station Master and Cleaning Staff.
 * Super Admin has system-wide access and bypasses this check.
 */
export const requireStationAccess = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.error(res, 'Authentication required.', 401)
  }

  // Super Admin can access any station
  if (req.user.role === 'super_admin') {
    return next()
  }

  // Extract station code from params, query, or body
  const targetStation =
    req.params.stationCode ||
    req.params.stationId ||
    req.query.stationCode ||
    req.query.stationId ||
    req.body.stationId ||
    req.body.stationCode

  if (!targetStation) {
    // If no specific station was requested in URL/params, ensure user has an assigned station
    if (!req.user.stationId) {
      return ApiResponse.error(res, 'No station assigned to your user account.', 403)
    }
    return next()
  }

  const cleanTarget = String(targetStation).trim().toUpperCase()
  const cleanAssigned = String(req.user.stationId || '').trim().toUpperCase()

  if (cleanTarget !== cleanAssigned) {
    return ApiResponse.error(
      res,
      `Access denied. You are only authorized for station ${cleanAssigned}, not ${cleanTarget}.`,
      403,
    )
  }

  next()
}

/**
 * Middleware to enforce read-only station access scoping.
 * Station Master and Super Admin are permitted to read any station code.
 */
export const requireStationReadAccess = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.error(res, 'Authentication required.', 401)
  }

  // Super Admin and Station Master can read any station's operational data
  if (req.user.role === 'super_admin' || req.user.role === 'station_master') {
    return next()
  }

  return ApiResponse.error(
    res,
    `Access denied. Role '${req.user.role}' does not have permission to access station operational data.`,
    403,
  )
}
