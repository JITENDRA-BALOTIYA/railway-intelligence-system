import { stationService } from '../services/stationService.js'
import { ApiResponse } from '../utils/apiResponse.js'

export const stationController = {
  async getAllStations(req, res, next) {
    try {
      const stations = await stationService.getAllStations()
      return ApiResponse.success(res, stations, 'Stations retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async getStationByCode(req, res, next) {
    try {
      const { stationCode } = req.params
      const station = await stationService.getStationByCode(stationCode)
      if (!station) {
        return ApiResponse.error(res, `Station ${stationCode} not found`, 404)
      }
      return ApiResponse.success(res, station, 'Station details retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async getStationCrowd(req, res, next) {
    try {
      const { stationCode } = req.params
      const crowd = await stationService.getStationCrowd(stationCode)
      if (!crowd) {
        return ApiResponse.error(res, `Crowd data for station ${stationCode} not found`, 404)
      }
      return ApiResponse.success(res, crowd, 'Station crowd analysis retrieved successfully')
    } catch (err) {
      next(err)
    }
  },
}
