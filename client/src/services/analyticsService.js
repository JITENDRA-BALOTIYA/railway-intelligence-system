import { apiClient } from './api.js'

export const analyticsService = {
  async getOverview() {
    return await apiClient.get('/analytics/overview')
  },

  async getCongestion() {
    return await apiClient.get('/analytics/congestion')
  },
}
