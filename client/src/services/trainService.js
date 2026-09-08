import { apiClient } from './api.js'

export const trainService = {
  async getTrains(params = {}) {
    return await apiClient.get('/trains', params)
  },

  async getTrainByNumber(trainNumber) {
    return await apiClient.get(`/trains/${trainNumber}`)
  },

  async getLiveTracking(trainNumber) {
    return await apiClient.get(`/trains/${trainNumber}/live`)
  },
}
