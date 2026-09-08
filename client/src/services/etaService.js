import { apiClient } from './api.js'

export const etaService = {
  async getETA(trainNumber) {
    return await apiClient.get(`/eta/${trainNumber}`)
  },

  async getETAHistory(trainNumber) {
    return await apiClient.get(`/eta/${trainNumber}/history`)
  },
}
