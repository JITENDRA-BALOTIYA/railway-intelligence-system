import { delayService } from '../services/delayService.js'
import { ApiResponse } from '../utils/apiResponse.js'

export const delayController = {
  async getDelay(req, res, next) {
    try {
      const { trainNumber } = req.params
      const delay = await delayService.getDelayByTrain(trainNumber)
      if (!delay) {
        return ApiResponse.error(res, `Delay details for train ${trainNumber} not found`, 404)
      }
      return ApiResponse.success(res, delay, 'Delay analysis retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async getDelayReasons(req, res, next) {
    try {
      const { trainNumber } = req.params
      const reasons = await delayService.getDelayReasons(trainNumber)
      if (!reasons) {
        return ApiResponse.error(res, `Delay reasons for train ${trainNumber} not found`, 404)
      }
      return ApiResponse.success(res, reasons, 'Delay reasons and forward risks retrieved successfully')
    } catch (err) {
      next(err)
    }
  },
}
