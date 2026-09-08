import { ApiResponse } from '../utils/apiResponse.js'
import { logger } from '../utils/logger.js'

export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - Error: ${err.message}`, err.stack)

  // Mongoose Cast Error (Invalid ObjectId)
  if (err.name === 'CastError') {
    return ApiResponse.error(res, `Resource not found: invalid ${err.path}`, 404)
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message)
    return ApiResponse.error(res, 'Validation Error', 400, messages)
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return ApiResponse.error(res, `Duplicate field value entered: ${field}`, 409)
  }

  // Handle explicitly thrown HTTP errors
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500)
  const message = err.message || 'Internal Server Error'

  return ApiResponse.error(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null,
  )
}
