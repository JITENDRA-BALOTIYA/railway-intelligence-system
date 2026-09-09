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

  async getStationArrivals(req, res, next) {
    try {
      const { stationCode } = req.params
      const arrivals = await stationService.getStationArrivals(stationCode)
      return ApiResponse.success(res, arrivals, 'Station arrivals retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async getStationDepartures(req, res, next) {
    try {
      const { stationCode } = req.params
      const departures = await stationService.getStationDepartures(stationCode)
      return ApiResponse.success(res, departures, 'Station departures retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async getStationPlatformStatus(req, res, next) {
    try {
      const { stationCode } = req.params
      const platforms = await stationService.getStationPlatformStatus(stationCode)
      return ApiResponse.success(res, platforms, 'Platform statuses retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async getStationAlerts(req, res, next) {
    try {
      const { stationCode } = req.params
      const alerts = await stationService.getStationAlerts(stationCode)
      return ApiResponse.success(res, alerts, 'Station alerts retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async getStationTrains(req, res, next) {
    try {
      const { stationCode } = req.params
      const { railRadarService } = await import('../services/railRadarService.js')
      const trains = await railRadarService.getStationTrains(stationCode)
      return ApiResponse.success(res, trains || { stationCode, trains: [] }, 'Station trains catalog')
    } catch (err) {
      next(err)
    }
  },
}
