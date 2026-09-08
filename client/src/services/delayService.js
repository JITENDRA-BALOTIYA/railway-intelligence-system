import { apiClient } from './api.js'

export const delayService = {
  async getDelay(trainNumber) {
    return await apiClient.get(`/delays/${trainNumber}`)
  },

  async getDelayReasons(trainNumber) {
    return await apiClient.get(`/delays/${trainNumber}/reasons`)
  },
}
