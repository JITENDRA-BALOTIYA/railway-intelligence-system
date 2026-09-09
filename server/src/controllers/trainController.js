import { trainService } from '../services/trainService.js'
import { ApiResponse } from '../utils/apiResponse.js'

export const trainController = {
  async getTrains(req, res, next) {
    try {
      const { search, status, limit } = req.query
      const trains = await trainService.getAllTrains({ search, status, limit })
      return ApiResponse.success(res, trains, 'Trains retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async getTrainByNumber(req, res, next) {
    try {
      const { trainNumber } = req.params
      const bypassCache = req.query.refresh === 'true' || req.query.bypassCache === 'true'
      const train = await trainService.getTrainByNumber(trainNumber, bypassCache)
      if (!train) {
        return ApiResponse.error(res, `Train ${trainNumber} not found. Please check the train number and try again.`, 404)
      }
      return ApiResponse.success(res, train, 'Train details retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async getLiveTracking(req, res, next) {
    try {
      const { trainNumber } = req.params
      const bypassCache = req.query.refresh === 'true' || req.query.bypassCache === 'true'
      const liveData = await trainService.getLiveStatus(trainNumber, bypassCache)
      if (!liveData) {
        return ApiResponse.error(res, `Train ${trainNumber} not found or live data currently unavailable. Please verify the train number.`, 404)
      }
      return ApiResponse.success(res, liveData, 'Live telemetry retrieved successfully')
    } catch (err) {
      next(err)
    }
  },
}
