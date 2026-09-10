import { apiClient } from './api.js'

export const trainService = {
  async getTrains(params = {}) {
    return await apiClient.get('/trains', params)
  },

  async getTrainByNumber(trainNumber, params = {}) {
    return await apiClient.get(`/trains/${trainNumber}`, params)
  },

  async getLiveTracking(trainNumber, params = {}) {
    return await apiClient.get(`/trains/${trainNumber}/live`, params)
  },

  async getTrainRoute(trainNumber, params = {}) {
    return await apiClient.get(`/trains/${trainNumber}/route`, params)
  },
}

