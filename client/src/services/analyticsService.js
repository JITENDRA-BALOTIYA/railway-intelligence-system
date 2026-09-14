import { apiClient } from './api.js'

export const analyticsService = {
  async getOverview() {
    return await apiClient.get('/analytics/overview')
  },

  async getCongestion() {
    return await apiClient.get('/analytics/congestion')
  },

  async executeReroute(actionId = 'ACT-001') {
    return await apiClient.post('/analytics/reroute', { actionId })
  },
}
