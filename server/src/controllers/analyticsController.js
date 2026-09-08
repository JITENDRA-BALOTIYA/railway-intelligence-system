import { analyticsService } from '../services/analyticsService.js'
import { ApiResponse } from '../utils/apiResponse.js'

export const analyticsController = {
  async getOverview(req, res, next) {
    try {
      const overview = await analyticsService.getOverview()
      return ApiResponse.success(res, overview, 'Analytics overview retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async getCongestion(req, res, next) {
    try {
      const congestion = await analyticsService.getCongestionData()
      return ApiResponse.success(res, congestion, 'Corridor congestion data retrieved successfully')
    } catch (err) {
      next(err)
    }
  },
}
