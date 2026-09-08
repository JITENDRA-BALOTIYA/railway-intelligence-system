import { etaService } from '../services/etaService.js'
import { ApiResponse } from '../utils/apiResponse.js'

export const etaController = {
  async getETA(req, res, next) {
    try {
      const { trainNumber } = req.params
      const prediction = await etaService.getPrediction(trainNumber)
      if (!prediction) {
        return ApiResponse.error(res, `ETA prediction for train ${trainNumber} not available`, 404)
      }
      return ApiResponse.success(res, prediction, 'ETA fetched successfully')
    } catch (err) {
      next(err)
    }
  },

  async getETAHistory(req, res, next) {
    try {
      const { trainNumber } = req.params
      const history = await etaService.getPredictionHistory(trainNumber)
      return ApiResponse.success(res, history, 'ETA prediction history retrieved successfully')
    } catch (err) {
      next(err)
    }
  },
}
