import { apiClient } from './api.js'

export const stationService = {
  async getStations() {
    return await apiClient.get('/stations')
  },

  async getStationByCode(stationCode) {
    return await apiClient.get(`/stations/${stationCode}`)
  },

  async getStationCrowd(stationCode) {
    return await apiClient.get(`/stations/${stationCode}/crowd`)
  },
}
