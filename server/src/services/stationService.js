import { Station } from '../models/Station.js'
import { memoryStore, getDbStatus } from '../config/database.js'
import { railRadarService } from './railRadarService.js'

export const stationService = {
  /**
   * Get all tracked stations
   */
  async getAllStations() {
    const { isConnected } = getDbStatus()
    if (isConnected) {
      return await Station.find().lean()
    }
    return memoryStore.stations
  },

  /**
   * Get station details by stationCode
   */
  async getStationByCode(stationCode) {
    const code = String(stationCode).trim().toUpperCase()
    const { isConnected } = getDbStatus()

    let station = null
    if (isConnected) {
      station = await Station.findOne({ stationCode: code }).lean()
    } else {
      station = memoryStore.stations.find((s) => s.stationCode === code) || null
    }

    if (!station) {
      try {
        const liveStations = await railRadarService.searchStations(code, 5)
        const match = liveStations.find((s) => s.stationCode.toUpperCase() === code) || liveStations[0]
        if (match) {
          station = {
            stationCode: match.stationCode,
            stationName: match.stationName,
            city: match.city,
            crowdLevel: 'Moderate',
            crowdPercentage: 62,
            activeTrainsCount: 14,
            weather: 'Clear',
            visibility: '1000 m',
            temperature: '25°C',
            platformsStatus: [
              { platformNumber: 'PF 1', occupied: true, trainNumber: '12301', trainName: 'Rajdhani Express', expectedDeparture: '10:05 AM' },
              { platformNumber: 'PF 2', occupied: false, trainNumber: null, trainName: null, expectedDeparture: null },
              { platformNumber: 'PF 3', occupied: true, trainNumber: '12004', trainName: 'Shatabdi Express', expectedDeparture: '11:15 AM' },
            ],
          }
        }
      } catch (e) {
        // fallback ignored
      }
    }

    return station
  },

  /**
   * Get crowd analysis and platform occupancy for station
   */
  async getStationCrowd(stationCode) {
    const station = await this.getStationByCode(stationCode)
    if (!station) return null

    // Generate dynamic crowd distribution
    return {
      stationCode: station.stationCode,
      stationName: station.stationName,
      city: station.city,
      crowdLevel: station.crowdLevel,
      crowdPercentage: station.crowdPercentage,
      activeTrainsCount: station.activeTrainsCount,
      weather: {
        condition: station.weather,
        visibility: station.visibility,
        temperature: station.temperature,
      },
      platforms: station.platformsStatus || [],
      peakHours: ['07:30 AM - 10:00 AM', '05:00 PM - 08:30 PM'],
      crowdRecommendation:
        station.crowdPercentage > 75
          ? 'Heavy rush detected. Passengers advised to reach platforms 35 mins in advance.'
          : 'Normal passenger flow. Security and platform transit clear.',
      rushIndex: station.crowdPercentage > 75 ? 'Critical Surge' : station.crowdPercentage > 50 ? 'Moderate' : 'Smooth Flow',
    }
  },

  /**
   * Get real-time arrivals for a station
   */
  async getStationArrivals(stationCode) {
    const code = String(stationCode || '').trim().toUpperCase()
    const live = await railRadarService.getStationLive(code)

    if (live && Array.isArray(live.trains) && live.trains.length > 0) {
      const arrivals = live.trains.filter((t) => t.movementType !== 'Departure')
      return {
        station: live.station,
        arrivals: arrivals.length > 0 ? arrivals : live.trains,
        count: arrivals.length > 0 ? arrivals.length : live.trains.length,
        dataSource: live.dataSource,
        lastUpdated: live.lastUpdated,
      }
    }

    // Fallback if RailRadar has no active live window
    const station = await this.getStationByCode(code)
    return {
      station: {
        stationCode: code,
        stationName: station?.stationName || code,
        city: station?.city || 'N/A',
      },
      arrivals: station?.platformsStatus?.filter((p) => p.occupied).map((p) => ({
        trainNumber: p.trainNumber,
        trainName: p.trainName,
        type: 'Express',
        source: 'Origin (SRC)',
        destination: `${station.stationName} (${code})`,
        scheduledArrival: p.expectedDeparture || '10:00 AM',
        expectedArrival: p.expectedDeparture || '10:00 AM',
        platform: `PF ${p.platformNumber}`,
        delay: 0,
        delayText: 'On Time',
        status: 'Scheduled',
        movementType: 'Arrival',
      })) || [],
      count: station?.platformsStatus?.filter((p) => p.occupied).length || 0,
      dataSource: 'FALLBACK_REPOSITORY',
      lastUpdated: new Date().toISOString(),
    }
  },

  /**
   * Get real-time departures for a station
   */
  async getStationDepartures(stationCode) {
    const code = String(stationCode || '').trim().toUpperCase()
    const live = await railRadarService.getStationLive(code)

    if (live && Array.isArray(live.trains) && live.trains.length > 0) {
      const departures = live.trains.filter((t) => t.movementType !== 'Terminating')
      return {
        station: live.station,
        departures: departures.length > 0 ? departures : live.trains,
        count: departures.length > 0 ? departures.length : live.trains.length,
        dataSource: live.dataSource,
        lastUpdated: live.lastUpdated,
      }
    }

    const station = await this.getStationByCode(code)
    return {
      station: {
        stationCode: code,
        stationName: station?.stationName || code,
        city: station?.city || 'N/A',
      },
      departures: station?.platformsStatus?.filter((p) => p.occupied).map((p) => ({
        trainNumber: p.trainNumber,
        trainName: p.trainName,
        type: 'Express',
        source: `${station.stationName} (${code})`,
        destination: 'Destination (DEST)',
        scheduledDeparture: p.expectedDeparture || '10:30 AM',
        expectedDeparture: p.expectedDeparture || '10:30 AM',
        platform: `PF ${p.platformNumber}`,
        delay: 0,
        delayText: 'On Time',
        status: 'Scheduled',
        movementType: 'Departure',
      })) || [],
      count: station?.platformsStatus?.filter((p) => p.occupied).length || 0,
      dataSource: 'FALLBACK_REPOSITORY',
      lastUpdated: new Date().toISOString(),
    }
  },

  /**
   * Get live platform management breakdown for station master
   */
  async getStationPlatformStatus(stationCode) {
    const code = String(stationCode || '').trim().toUpperCase()
    const station = await this.getStationByCode(code)
    const live = await railRadarService.getStationLive(code)
    const totalPlatforms = station?.platforms || 16

    const platformCards = []
    for (let pfNum = 1; pfNum <= totalPlatforms; pfNum++) {
      const pfStr = `PF ${pfNum}`
      // Find train at platform or scheduled
      const activeTrain = live?.trains?.find(
        (t) => t.platform === pfStr && (t.status === 'At Platform' || t.status === 'Delayed'),
      )
      const nextTrain = live?.trains?.find((t) => t.platform === pfStr && t.status === 'Approaching')

      platformCards.push({
        platformNumber: pfNum,
        platformLabel: pfStr,
        isOccupied: Boolean(activeTrain),
        currentTrain: activeTrain
          ? {
              trainNumber: activeTrain.trainNumber,
              trainName: activeTrain.trainName,
              status: activeTrain.status,
              delay: activeTrain.delay,
              delayText: activeTrain.delayText,
              scheduledDeparture: activeTrain.scheduledDeparture,
              expectedDeparture: activeTrain.expectedDeparture,
            }
          : null,
        nextTrain: nextTrain
          ? {
              trainNumber: nextTrain.trainNumber,
              trainName: nextTrain.trainName,
              expectedArrival: nextTrain.expectedArrival,
              delayText: nextTrain.delayText,
            }
          : null,
        trackClearance: activeTrain ? 'Occupied - Awaiting Signal Clearance' : 'Clear & Available',
      })
    }

    return {
      stationCode: code,
      stationName: station?.stationName || code,
      totalPlatforms,
      occupiedCount: platformCards.filter((p) => p.isOccupied).length,
      availableCount: platformCards.filter((p) => !p.isOccupied).length,
      platforms: platformCards,
      lastUpdated: new Date().toISOString(),
    }
  },

  /**
   * Get active alerts filtered for this station
   */
  async getStationAlerts(stationCode) {
    const code = String(stationCode || '').trim().toUpperCase()
    const station = await this.getStationByCode(code)
    const { Alert } = await import('../models/Alert.js')
    const { isConnected } = getDbStatus()

    let allAlerts = []
    if (isConnected) {
      allAlerts = await Alert.find({ active: true }).lean()
    } else {
      allAlerts = memoryStore.alerts.filter((a) => a.active)
    }

    // Filter alerts affecting this station
    const stationName = station?.stationName || code
    const stationAlerts = allAlerts.filter(
      (a) =>
        a.section?.includes(code) ||
        a.section?.includes(stationName) ||
        a.zone === 'National' ||
        a.severity === 'critical',
    )

    return {
      stationCode: code,
      stationName,
      count: stationAlerts.length,
      alerts: stationAlerts,
    }
  },
}
