import { routeService } from '../services/routeService.js'
import { railwayDataProvider } from '../providers/railwayProvider.js'
import { ApiResponse } from '../utils/apiResponse.js'

export const routeController = {
  /**
   * GET /api/routes?from=NDLS&to=CNB
   */
  async getRoute(req, res, next) {
    try {
      const { from, to } = req.query
      if (!from || !to) {
        return ApiResponse.error(res, 'Both "from" and "to" station codes are required (e.g. ?from=NDLS&to=CNB)', 400)
      }

      const result = await routeService.getRoute(from, to)
      return ApiResponse.success(res, result.route, `Route intelligence from ${from} to ${to} generated successfully`)
    } catch (err) {
      if (err.statusCode === 404) {
        return ApiResponse.error(res, err.message, 404)
      }
      next(err)
    }
  },

  /**
   * GET /api/routes/live?from=NDLS&to=CNB
   */
  async getLiveRoute(req, res, next) {
    try {
      const { from, to } = req.query
      if (!from || !to) {
        return ApiResponse.error(res, 'Both "from" and "to" station codes are required', 400)
      }

      const result = await routeService.getRoute(from, to)
      return ApiResponse.success(res, result.route, `Live route telemetry for ${from}-${to} retrieved successfully`)
    } catch (err) {
      if (err.statusCode === 404) {
        return ApiResponse.error(res, err.message, 404)
      }
      next(err)
    }
  },

  /**
   * GET /api/routes/stations - Autocomplete stations
   */
  async getStationList(req, res, next) {
    try {
      const { query, limit } = req.query
      const stations = railwayDataProvider.searchStations(query || '', parseInt(limit, 10) || 30)
      return ApiResponse.success(res, stations, 'Available stations list retrieved')
    } catch (err) {
      next(err)
    }
  },
}
