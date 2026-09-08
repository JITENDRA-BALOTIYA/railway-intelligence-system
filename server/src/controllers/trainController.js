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
      const train = await trainService.getTrainByNumber(trainNumber)
      if (!train) {
        return ApiResponse.error(res, `Train ${trainNumber} not found`, 404)
      }
      return ApiResponse.success(res, train, 'Train details retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async getLiveTracking(req, res, next) {
    try {
      const { trainNumber } = req.params
      const liveData = await trainService.getLiveStatus(trainNumber)
      if (!liveData) {
        return ApiResponse.error(res, `Live data for train ${trainNumber} not found`, 404)
      }
      return ApiResponse.success(res, liveData, 'Live telemetry retrieved successfully')
    } catch (err) {
      next(err)
    }
  },
}
