import { Alert } from '../models/Alert.js'
import { memoryStore, getDbStatus } from '../config/database.js'
import { ApiResponse } from '../utils/apiResponse.js'

export const alertController = {
  async getAlerts(req, res, next) {
    try {
      const { isConnected } = getDbStatus()
      let alerts = []

      if (isConnected) {
        alerts = await Alert.find({ active: true }).sort({ timestamp: -1 }).lean()
      } else {
        alerts = memoryStore.alerts.filter((a) => a.active !== false)
      }

      return ApiResponse.success(res, alerts, 'Active alerts retrieved successfully')
    } catch (err) {
      next(err)
    }
  },
}
