import { ApiResponse } from '../utils/apiResponse.js'

export const validateRequest = (schema) => (req, res, next) => {
  if (!schema) return next()

  const { error } = schema(req)
  if (error) {
    return ApiResponse.error(res, error.message || 'Invalid request parameters', 400, error.details)
  }
  next()
}
