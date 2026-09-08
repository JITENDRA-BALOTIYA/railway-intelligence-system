import { ApiResponse } from '../utils/apiResponse.js'

export const notFound = (req, res, next) => {
  return ApiResponse.error(res, `Route not found - ${req.originalUrl}`, 404)
}
