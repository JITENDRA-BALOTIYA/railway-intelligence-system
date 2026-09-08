import { dashboardData, trainData } from '../data/mockRailwayData.js'

export const railwayService = {
  getDashboard() {
    return dashboardData
  },

  getTrains() {
    return trainData
  },

  getTrainById(trainId) {
    return trainData.find((train) => train.id === trainId) || null
  },
}
