import { railRadarService } from '../services/railRadarService.js'
import { stationService } from '../services/stationService.js'
import { cleaningService } from '../services/cleaningService.js'
import { analyticsService } from '../services/analyticsService.js'
import { ApiResponse } from '../utils/apiResponse.js'

export const dashboardController = {
  /**
   * Get role-tailored dashboard metrics
   */
  async getRoleDashboard(req, res, next) {
    try {
      const role = req.user?.role || 'public_user'
      const stationId = String(req.query.stationId || req.user?.stationId || 'NDLS').trim().toUpperCase()

      if (role === 'station_master') {
        const [liveStation, stationProfile, platformData, alerts] = await Promise.all([
          railRadarService.getStationLive(stationId),
          stationService.getStationByCode(stationId),
          stationService.getStationPlatformStatus(stationId),
          stationService.getStationAlerts(stationId),
        ])

        if (!stationProfile && !liveStation) {
          return ApiResponse.error(res, `Station ${stationId} not found`, 404)
        }

        const trains = liveStation?.trains || []
        const delayed = trains.filter((t) => t.delay > 15).length
        const onTime = trains.filter((t) => t.delay <= 15).length
        const total = trains.length || 1
        const onTimeRate = Math.round((onTime / total) * 100)
        const avgDelay =
          trains.length > 0
            ? Math.round(trains.reduce((acc, t) => acc + (t.delay || 0), 0) / trains.length)
            : 0

        return ApiResponse.success(res, {
          role: 'station_master',
          station: {
            stationCode: stationId,
            stationName: stationProfile?.stationName || liveStation?.station?.stationName || stationId,
            city: stationProfile?.city || liveStation?.station?.city || 'N/A',
            crowdLevel: stationProfile?.crowdLevel || 'Moderate',
            crowdPercentage: stationProfile?.crowdPercentage || 65,
            weather: stationProfile?.weather || 'Clear Sky',
            temperature: stationProfile?.temperature || '26°C',
          },
          kpis: {
            trainsArrivingToday: trains.filter((t) => t.movementType !== 'Departure').length,
            trainsDepartingToday: trains.filter((t) => t.movementType !== 'Terminating').length,
            delayedTrains: delayed,
            onTimeRate: `${onTimeRate}%`,
            averageDelayMinutes: avgDelay,
            activePlatforms: platformData.occupiedCount,
            totalPlatforms: platformData.totalPlatforms,
          },
          trains,
          platforms: platformData.platforms,
          alerts: alerts.alerts,
        })
      }

      if (role === 'cleaning_staff') {
        const [stats, upcoming, tasks] = await Promise.all([
          cleaningService.getCleaningStats(stationId),
          cleaningService.getUpcomingApproaching(stationId),
          cleaningService.getTasksForStation(stationId),
        ])

        return ApiResponse.success(res, {
          role: 'cleaning_staff',
          station: {
            stationCode: stationId,
            stationName: stationId === 'NDLS' ? 'New Delhi Railway Station' : `${stationId} Station`,
          },
          kpis: stats,
          upcoming,
          queue: tasks,
        })
      }

      if (role === 'super_admin') {
        const overview = await analyticsService.getOverview()
        return ApiResponse.success(res, {
          role: 'super_admin',
          overview,
        })
      }

      // Public User
      return ApiResponse.success(res, {
        role: 'public_user',
        popularTrains: [
          { number: '12301', name: 'Howrah Rajdhani', route: 'HWH - NDLS', status: 'Running' },
          { number: '12951', name: 'Mumbai Rajdhani', route: 'MMCT - NDLS', status: 'Running' },
          { number: '22436', name: 'Vande Bharat Exp', route: 'NDLS - BSB', status: 'On Time' },
          { number: '12002', name: 'Bhopal Shatabdi', route: 'NDLS - RKMP', status: 'Running' },
        ],
      })
    } catch (err) {
      next(err)
    }
  },
}
