import { apiClient } from './api.js'

export const alertService = {
  async getAlerts() {
    return await apiClient.get('/alerts')
  },
}
