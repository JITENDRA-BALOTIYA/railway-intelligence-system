import { apiClient } from './api.js'

export const etaService = {
  async getETA(trainNumber) {
    return await apiClient.get(`/eta/${trainNumber}`)
  },

  async getFullETA(trainNumber) {
    return await apiClient.get(`/eta/${trainNumber}/full`)
  },

  async getETAHistory(trainNumber) {
    return await apiClient.get(`/eta/${trainNumber}/history`)
  },
}
