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

  async getStationSchedule(req, res, next) {
    try {
      const { stationCode } = req.params
      const schedule = await stationService.getStationSchedule(stationCode)
      return ApiResponse.success(res, schedule, 'Station schedule timetable retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async getPlatformDetail(req, res, next) {
    try {
      const { stationCode, platformNumber } = req.params
      const platform = await stationService.getPlatformDetail(stationCode, platformNumber)
      if (!platform) {
        return ApiResponse.error(res, `Platform ${platformNumber} at station ${stationCode} not found`, 404)
      }
      return ApiResponse.success(res, platform, 'Platform operational detail retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async getStationAlertDetail(req, res, next) {
    try {
      const { stationCode, alertId } = req.params
      const alert = await stationService.getStationAlertDetail(stationCode, alertId)
      if (!alert) {
        return ApiResponse.error(res, `Alert ${alertId} not found`, 404)
      }
      return ApiResponse.success(res, alert, 'Alert detail retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async acknowledgeAlert(req, res, next) {
    try {
      const { stationCode, alertId } = req.params
      const userName = req.user?.name || req.user?.email || 'Station Master'
      const updated = await stationService.acknowledgeStationAlert(stationCode, alertId, userName)
      if (!updated) {
        return ApiResponse.error(res, `Alert ${alertId} not found or could not be acknowledged`, 404)
      }
      return ApiResponse.success(res, updated, 'Alert acknowledged successfully')
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
