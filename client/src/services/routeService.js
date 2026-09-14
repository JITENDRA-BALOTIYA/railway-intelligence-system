import { apiClient } from './api.js'

export const routeService = {
  /**
   * Fetch route details between two station codes
   * @param {string} from - Origin station code (e.g. 'NDLS')
   * @param {string} to - Destination station code (e.g. 'CNB')
   * @param {boolean} forceLive - Force live telemetry provider
   */
  async getRoute(from, to, forceLive = false) {
    const endpoint = forceLive ? '/routes/live' : '/routes'
    return await apiClient.get(endpoint, {
      from: from.trim().toUpperCase(),
      to: to.trim().toUpperCase(),
    })
  },

  /**
   * Fetch list of available stations for search/autocomplete
   */
  async getStations() {
    return await apiClient.get('/routes/stations')
  },

  /**
   * Fetch real-time operational status for a single station
   * @param {string} stationCode
   */
  async getStationStatus(stationCode) {
    return await apiClient.get(`/stations/${stationCode.trim().toUpperCase()}/status`)
  },
}
