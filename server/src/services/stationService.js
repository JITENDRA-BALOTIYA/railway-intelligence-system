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
   * Get today's full scheduled train timetable for station
   */
  async getStationSchedule(stationCode) {
    const code = String(stationCode || '').trim().toUpperCase()
    const station = await this.getStationByCode(code)
    const live = await railRadarService.getStationLive(code)
    const catalog = await railRadarService.getStationTrains(code)

    const scheduleMap = new Map()

    // 1. Ingest live trains (rich with expected times and live delays)
    if (live && Array.isArray(live.trains)) {
      live.trains.forEach((t) => {
        scheduleMap.set(t.trainNumber, {
          ...t,
          dataSource: live.dataSource,
        })
      })
    }

    // 2. Ingest catalog trains if not already in map
    if (catalog && Array.isArray(catalog.trains)) {
      catalog.trains.forEach((t) => {
        if (!scheduleMap.has(t.trainNumber)) {
          scheduleMap.set(t.trainNumber, {
            ...t,
            dataSource: catalog.dataSource,
          })
        }
      })
    }

    // 3. Fallback if no RailRadar data: search Train models / memoryStore
    if (scheduleMap.size === 0) {
      const { Train } = await import('../models/Train.js')
      const { isConnected } = getDbStatus()
      let allTrains = []
      if (isConnected) {
        allTrains = await Train.find().lean()
      } else {
        allTrains = memoryStore.trains || []
      }

      allTrains.forEach((tr) => {
        const halt = tr.timeline?.find((h) => h.stationCode === code || h.station?.includes(code))
        if (halt) {
          scheduleMap.set(tr.trainNumber, {
            trainNumber: tr.trainNumber,
            trainName: tr.trainName,
            type: tr.type || 'Express',
            source: tr.source,
            destination: tr.destination,
            scheduledArrival: halt.scheduledTime || 'N/A',
            scheduledDeparture: halt.time || 'N/A',
            expectedArrival: halt.expectedTime || halt.time || 'N/A',
            expectedDeparture: halt.time || 'N/A',
            platform: halt.platform ? (halt.platform.startsWith('PF') ? halt.platform : `PF ${halt.platform.replace(/[^0-9]/g, '') || '1'}`) : 'PF —',
            delay: tr.delay || 0,
            delayText: tr.delay > 0 ? `+${tr.delay} min` : 'On Time',
            status: tr.status || 'Scheduled',
            runDays: tr.runDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            dataSource: 'FALLBACK_REPOSITORY',
          })
        }
      })
    }

    const trainsList = Array.from(scheduleMap.values())

    return {
      station: {
        stationCode: code,
        stationName: station?.stationName || code,
        city: station?.city || 'N/A',
      },
      trains: trainsList,
      count: trainsList.length,
      lastUpdated: live?.lastUpdated || new Date().toISOString(),
      dataSource: live?.dataSource || 'SCHEDULE_CATALOG',
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
   * Get detailed platform status including current train telemetry & scheduled queue
   */
  async getPlatformDetail(stationCode, platformNumber) {
    const code = String(stationCode || '').trim().toUpperCase()
    const pfNum = parseInt(String(platformNumber).replace(/[^0-9]/g, ''), 10) || 1
    const pfLabel = `PF ${pfNum}`

    const station = await this.getStationByCode(code)
    const live = await railRadarService.getStationLive(code)
    const catalog = await railRadarService.getStationTrains(code)

    // Check station platform status from DB/memoryStore as fallback or metadata
    const dbPf = station?.platformsStatus?.find((p) => {
      const pNum = typeof p.platformNumber === 'number' ? p.platformNumber : parseInt(String(p.platformNumber).replace(/[^0-9]/g, ''), 10)
      return pNum === pfNum
    })

    // Find train currently occupying this platform
    let activeTrain = live?.trains?.find((t) => {
      const pMatch = t.platform === pfLabel || t.platform === `Platform ${pfNum}` || t.platform === String(pfNum)
      return pMatch && (t.status === 'At Platform' || t.liveType === 'at-station' || t.status === 'Delayed' || t.status === 'Running Late')
    })

    if (!activeTrain && dbPf && dbPf.occupied && dbPf.trainNumber) {
      activeTrain = {
        trainNumber: dbPf.trainNumber,
        trainName: dbPf.trainName,
        type: 'Express',
        source: 'Origin (SRC)',
        destination: `${station?.stationName || code} (${code})`,
        scheduledArrival: 'N/A',
        expectedArrival: 'N/A',
        scheduledDeparture: dbPf.expectedDeparture || 'N/A',
        expectedDeparture: dbPf.expectedDeparture || 'N/A',
        platform: pfLabel,
        delay: 0,
        delayText: 'On Time',
        status: 'At Platform',
        speed: 0,
        currentStation: `${station?.stationName || code} (${code})`,
      }
    }

    // If active train found, enrich with live status details
    let currentTrain = null
    if (activeTrain) {
      const fullLive = await railRadarService.getLiveStatus(activeTrain.trainNumber).catch(() => null)
      currentTrain = {
        trainNumber: activeTrain.trainNumber,
        trainName: fullLive?.trainName || activeTrain.trainName,
        type: fullLive?.type || activeTrain.type || 'Express',
        source: fullLive?.source || activeTrain.source || 'N/A',
        destination: fullLive?.destination || activeTrain.destination || 'N/A',
        status: fullLive?.status || activeTrain.status || 'At Platform',
        delay: fullLive?.delay ?? activeTrain.delay ?? 0,
        delayText: activeTrain.delayText || (fullLive?.delay > 0 ? `+${fullLive.delay} min` : 'On Time'),
        speed: fullLive?.speed ?? 0,
        currentStation: fullLive?.currentStation || `${station?.stationName || code} (${code})`,
        scheduledArrival: activeTrain.scheduledArrival || 'N/A',
        expectedArrival: activeTrain.expectedArrival || 'N/A',
        scheduledDeparture: activeTrain.scheduledDeparture || 'N/A',
        expectedDeparture: activeTrain.expectedDeparture || 'N/A',
        platform: pfLabel,
        distanceCoveredKm: fullLive?.distanceCoveredKm ?? null,
        totalDistanceKm: fullLive?.totalDistanceKm ?? null,
      }
    }

    // Find next 2-3 scheduled trains for this platform
    const allCandidates = [
      ...(live?.trains || []),
      ...(catalog?.trains || []),
    ].filter((t) => {
      const pMatch = t.platform === pfLabel || t.platform === `Platform ${pfNum}` || t.platform === String(pfNum)
      if (currentTrain && t.trainNumber === currentTrain.trainNumber) return false
      return true
    })

    // Deduplicate candidates
    const nextMap = new Map()
    allCandidates.forEach((t) => {
      if (!nextMap.has(t.trainNumber)) {
        nextMap.set(t.trainNumber, {
          trainNumber: t.trainNumber,
          trainName: t.trainName,
          type: t.type || 'Express',
          source: t.source || 'N/A',
          destination: t.destination || 'N/A',
          scheduledArrival: t.scheduledArrival || 'N/A',
          expectedArrival: t.expectedArrival || t.scheduledArrival || 'N/A',
          scheduledDeparture: t.scheduledDeparture || 'N/A',
          expectedDeparture: t.expectedDeparture || t.scheduledDeparture || 'N/A',
          delay: t.delay || 0,
          delayText: t.delayText || 'On Time',
          status: t.status || 'Approaching',
          platform: pfLabel,
        })
      }
    })

    const nextTrains = Array.from(nextMap.values()).slice(0, 3)

    const isOccupied = Boolean(currentTrain)
    const occupancyWindow = isOccupied
      ? `Occupied until ${currentTrain.expectedDeparture !== 'N/A' ? currentTrain.expectedDeparture : 'departure'}`
      : 'Clear & Available'
    const trackClearance = isOccupied
      ? 'Occupied - Awaiting Signal Clearance'
      : 'Clear & Available for Routing'

    return {
      stationCode: code,
      stationName: station?.stationName || code,
      platformNumber: pfNum,
      platformLabel: pfLabel,
      isOccupied,
      occupancyStatus: isOccupied ? 'Occupied' : 'Clear & Ready',
      occupancyWindow,
      trackClearance,
      currentTrain,
      nextTrains,
      estimatedClearanceTime: isOccupied
        ? (currentTrain.expectedDeparture !== 'N/A' ? currentTrain.expectedDeparture : 'Scheduled Departure')
        : 'Immediate',
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
      allAlerts = await Alert.find().lean()
    } else {
      allAlerts = memoryStore.alerts || []
    }

    // Filter alerts affecting this station
    const stationName = station?.stationName || code
    const stationAlerts = allAlerts
      .filter(
        (a) =>
          a.section?.includes(code) ||
          a.section?.includes(stationName) ||
          a.zone === 'National' ||
          a.severity === 'critical',
      )
      .map((a) => ({
        id: a._id ? a._id.toString() : a.id,
        _id: a._id ? a._id.toString() : a.id,
        title: a.title,
        description: a.message || a.description,
        message: a.message || a.description,
        severity: a.severity || 'info',
        section: a.section,
        zone: a.zone,
        affectedTrains: a.affectedTrains || [],
        platform: a.platform || null,
        active: a.active !== false,
        status: a.status || (a.active !== false ? 'active' : 'acknowledged'),
        raisedTime: a.timestamp || a.createdAt || new Date().toISOString(),
        timestamp: a.timestamp || a.createdAt || new Date().toISOString(),
        acknowledgedBy: a.acknowledgedBy || null,
        acknowledgedAt: a.acknowledgedAt || null,
      }))

    return {
      stationCode: code,
      stationName,
      count: stationAlerts.length,
      alerts: stationAlerts,
    }
  },

  /**
   * Get full detail for a single alert
   */
  async getStationAlertDetail(stationCode, alertId) {
    const code = String(stationCode || '').trim().toUpperCase()
    const { Alert } = await import('../models/Alert.js')
    const { isConnected } = getDbStatus()

    let alert = null
    if (isConnected) {
      try {
        alert = await Alert.findById(alertId).lean()
      } catch {
        alert = await Alert.findOne({ $or: [{ _id: alertId }, { id: alertId }] }).lean()
      }
    } else {
      alert = memoryStore.alerts.find((a) => a._id === alertId || a.id === alertId)
    }

    if (!alert) return null

    let platform = alert.platform || null
    if (!platform && alert.message) {
      const pfMatch = alert.message.match(/PF\s*\d+|Platform\s*\d+/i) || alert.title?.match(/PF\s*\d+|Platform\s*\d+/i)
      if (pfMatch) platform = pfMatch[0]
    }

    return {
      id: alert._id ? alert._id.toString() : alert.id,
      _id: alert._id ? alert._id.toString() : alert.id,
      title: alert.title,
      description: alert.message || alert.description,
      message: alert.message || alert.description,
      severity: alert.severity || 'info',
      section: alert.section || `${code} Hub`,
      zone: alert.zone || 'All',
      affectedTrains: alert.affectedTrains || [],
      platform,
      active: alert.active !== false,
      status: alert.status || (alert.active !== false ? 'active' : 'acknowledged'),
      raisedTime: alert.timestamp || alert.createdAt || new Date().toISOString(),
      timestamp: alert.timestamp || alert.createdAt || new Date().toISOString(),
      acknowledgedBy: alert.acknowledgedBy || null,
      acknowledgedAt: alert.acknowledgedAt || null,
    }
  },

  /**
   * Mark alert as acknowledged
   */
  async acknowledgeStationAlert(stationCode, alertId, userName = 'Station Master') {
    const { Alert } = await import('../models/Alert.js')
    const { isConnected } = getDbStatus()

    const now = new Date()
    let updated = null

    if (isConnected) {
      try {
        updated = await Alert.findByIdAndUpdate(
          alertId,
          {
            status: 'acknowledged',
            acknowledgedBy: userName,
            acknowledgedAt: now,
          },
          { new: true },
        ).lean()
      } catch {
        updated = await Alert.findOneAndUpdate(
          { $or: [{ _id: alertId }, { id: alertId }] },
          {
            status: 'acknowledged',
            acknowledgedBy: userName,
            acknowledgedAt: now,
          },
          { new: true },
        ).lean()
      }
    } else {
      const idx = memoryStore.alerts.findIndex((a) => a._id === alertId || a.id === alertId)
      if (idx !== -1) {
        memoryStore.alerts[idx] = {
          ...memoryStore.alerts[idx],
          status: 'acknowledged',
          acknowledgedBy: userName,
          acknowledgedAt: now,
        }
        updated = memoryStore.alerts[idx]
      }
    }

    if (!updated) return null

    return {
      id: updated._id ? updated._id.toString() : updated.id,
      _id: updated._id ? updated._id.toString() : updated.id,
      title: updated.title,
      message: updated.message || updated.description,
      description: updated.message || updated.description,
      severity: updated.severity,
      section: updated.section,
      zone: updated.zone,
      affectedTrains: updated.affectedTrains || [],
      platform: updated.platform || null,
      active: updated.active !== false,
      status: 'acknowledged',
      raisedTime: updated.timestamp || updated.createdAt,
      acknowledgedBy: userName,
      acknowledgedAt: now,
    }
  },
}
