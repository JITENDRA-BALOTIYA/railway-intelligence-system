import { apiClient } from './api.js'

export const stationService = {
  async getStations() {
    return await apiClient.get('/stations')
  },

  async searchStations(query) {
    return await apiClient.get('/stations/search', { query })
  },

  async getStationByCode(stationCode) {
    return await apiClient.get(`/stations/${stationCode}`)
  },

  async getStationCrowd(stationCode) {
    return await apiClient.get(`/stations/${stationCode}/crowd`)
  },
}
