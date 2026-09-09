import { config } from '../config/env.js'
import { logger } from '../utils/logger.js'

class RailRadarService {
  constructor() {
    this.apiKey = config.railradarApiKey
    this.baseUrl = config.railradarBaseUrl || 'https://api.railradar.in'
    this.cache = new Map()
    this.cacheTtlMs = 45 * 1000 // 45s cache for live data to ensure freshness while respecting rate limits
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'x-api-key': this.apiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }

  async fetchApi(endpoint, bypassCache = false) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
    
    if (!bypassCache) {
      const cached = this.cache.get(url)
      if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
        return { data: cached.data, isCached: true, cacheTimestamp: cached.timestamp }
      }
    }

    try {
      logger.info(`RailRadar Request: ${url}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        throw new Error(`RailRadar API returned HTTP ${response.status}: ${response.statusText}`)
      }

      const json = await response.json()
      if (json.success && json.data) {
        this.cache.set(url, { data: json.data, timestamp: Date.now() })
        return { data: json.data, isCached: false, cacheTimestamp: Date.now() }
      }

      return json.data ? { data: json.data, isCached: false, cacheTimestamp: Date.now() } : null
    } catch (err) {
      logger.warn(`RailRadar request failed for ${url}: ${err.message}`)
      // Return cached item if available even if expired, as fallback
      const cached = this.cache.get(url)
      if (cached) {
        return { data: cached.data, isCached: true, cacheTimestamp: cached.timestamp }
      }
      return null
    }
  }

  /**
   * Fetch real-time live running status for a train
   */
  async getLiveStatus(trainNumber, bypassCache = false) {
    const cleanNum = String(trainNumber).trim()
    const result = await this.fetchApi(`/v1/trains/${cleanNum}/live`, bypassCache)
    
    if (result && result.data) {
      return this.transformLiveStatus(result.data, result.isCached, result.cacheTimestamp)
    }

    // If live endpoint did not return (e.g. train not running today), try fetching static schedule/metadata
    const detailsResult = await this.fetchApi(`/v1/trains/${cleanNum}`, bypassCache)
    if (detailsResult && detailsResult.data) {
      return this.transformTrainDetails(detailsResult.data, detailsResult.isCached, detailsResult.cacheTimestamp)
    }

    return null
  }

  /**
   * Fetch train schedule and metadata
   */
  async getTrainDetails(trainNumber, bypassCache = false) {
    const cleanNum = String(trainNumber).trim()
    const result = await this.fetchApi(`/v1/trains/${cleanNum}`, bypassCache)
    if (!result || !result.data) return null

    return this.transformTrainDetails(result.data, result.isCached, result.cacheTimestamp)
  }

  /**
   * Fetch GeoJSON route geometry
   */
  async getTrainRoute(trainNumber) {
    const cleanNum = String(trainNumber).trim()
    const result = await this.fetchApi(`/v1/trains/${cleanNum}/route`)
    return result ? result.data : null
  }

  /**
   * Autocomplete search for trains
   */
  async searchTrains(query, limit = 20) {
    if (!query || query.trim().length === 0) return []
    const result = await this.fetchApi(`/v1/lookup/search/trains?q=${encodeURIComponent(query.trim())}&limit=${limit}`)
    if (!result || !result.data || !Array.isArray(result.data)) return []

    return result.data.map((t) => ({
      trainNumber: t.number,
      trainName: t.name,
      source: t.sourceName || t.source,
      sourceCode: t.source,
      destination: t.destName || t.dest,
      destinationCode: t.dest,
      type: t.type || 'Express',
      status: 'Scheduled',
      delay: 0,
      speed: 0,
      progress: 0,
      popularity: t.popularity || 0,
      dataSource: 'RAILRADAR',
    }))
  }

  /**
   * Autocomplete search for stations
   */
  async searchStations(query, limit = 20) {
    if (!query || query.trim().length === 0) return []
    const result = await this.fetchApi(`/v1/lookup/search/stations?q=${encodeURIComponent(query.trim())}&limit=${limit}`)
    if (!result || !result.data || !Array.isArray(result.data)) return []

    return result.data.map((s) => ({
      stationCode: s.code,
      stationName: s.name,
      city: s.city || s.name,
      active: s.isActive ?? true,
    }))
  }

  /**
   * Fetch real-time live trains at a station (arrivals, departures, platform, delays)
   */
  async getStationLive(stationCode, bypassCache = false) {
    const cleanCode = String(stationCode || '').trim().toUpperCase()
    if (!cleanCode) return null

    const result = await this.fetchApi(`/v1/stations/${cleanCode}/live`, bypassCache)
    if (!result || !result.data) return null

    const raw = result.data
    const stationInfo = raw.station || {}
    const rawTrains = Array.isArray(raw.trains) ? raw.trains : []

    const normalizedTrains = rawTrains.map((t) => {
      const train = t.train || {}
      const stop = t.stop || {}
      const live = t.live || {}
      const delayMinutes = live.delayMinutes != null ? Math.max(0, live.delayMinutes) : 0

      const schedArr = stop.arrival || 'N/A'
      const schedDep = stop.departure || 'N/A'

      let expArr = 'N/A'
      if (live.expectedArrivalTime) {
        try {
          expArr = new Date(live.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } catch {
          expArr = schedArr
        }
      } else if (schedArr !== 'N/A') {
        expArr = schedArr
      }

      let expDep = 'N/A'
      if (live.expectedDepartureTime) {
        try {
          expDep = new Date(live.expectedDepartureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } catch {
          expDep = schedDep
        }
      } else if (schedDep !== 'N/A') {
        expDep = schedDep
      }

      const rawPlatform = stop.platform ? `PF ${stop.platform}` : 'PF —'
      const movementType =
        !stop.arrival || stop.sequence === 1 ? 'Departure' : !stop.departure ? 'Terminating' : 'Transit'

      const status =
        live.type === 'at-station'
          ? 'At Platform'
          : delayMinutes > 15
          ? 'Delayed'
          : delayMinutes > 0
          ? 'Running Late'
          : 'On Time'

      return {
        trainNumber: String(train.number || 'N/A'),
        trainName: train.name || 'N/A',
        type: train.type || 'Express',
        source: typeof train.source === 'object' ? train.source.name || train.source.code : train.source || 'N/A',
        destination:
          typeof train.destination === 'object'
            ? train.destination.name || train.destination.code
            : train.destination || 'N/A',
        scheduledArrival: schedArr,
        scheduledDeparture: schedDep,
        expectedArrival: expArr,
        expectedDeparture: expDep,
        platform: rawPlatform,
        delay: delayMinutes,
        delayText: delayMinutes > 0 ? `+${delayMinutes} min` : 'On Time',
        status,
        movementType,
        liveType: live.type || 'approaching',
        distance: stop.distance != null ? `${stop.distance} km` : 'N/A',
      }
    })

    return {
      station: {
        stationCode: stationInfo.code || cleanCode,
        stationName: stationInfo.name || cleanCode,
        city: stationInfo.city || 'N/A',
        lat: stationInfo.lat || null,
        lng: stationInfo.lng || null,
      },
      trains: normalizedTrains,
      count: raw.count || normalizedTrains.length,
      dataSource: result.isCached ? 'CACHED' : 'RAILRADAR',
      lastUpdated: new Date(result.cacheTimestamp || Date.now()).toISOString(),
    }
  }

  /**
   * Fetch full catalog of scheduled trains passing through a station
   */
  async getStationTrains(stationCode, bypassCache = false) {
    const cleanCode = String(stationCode || '').trim().toUpperCase()
    if (!cleanCode) return null

    const result = await this.fetchApi(`/v1/stations/${cleanCode}/trains`, bypassCache)
    if (!result || !result.data) return null

    const raw = result.data
    const stationInfo = raw.station || {}
    const rawTrains = Array.isArray(raw.trains) ? raw.trains : []

    const normalizedTrains = rawTrains.map((t) => {
      const train = t.train || {}
      const stop = t.stop || {}

      return {
        trainNumber: String(train.number || 'N/A'),
        trainName: train.name || 'N/A',
        type: train.type || 'Express',
        source: typeof train.source === 'object' ? train.source.name || train.source.code : train.source || 'N/A',
        destination:
          typeof train.destination === 'object'
            ? train.destination.name || train.destination.code
            : train.destination || 'N/A',
        scheduledArrival: stop.arrival || 'N/A',
        scheduledDeparture: stop.departure || 'N/A',
        expectedArrival: stop.arrival || 'N/A',
        expectedDeparture: stop.departure || 'N/A',
        platform: stop.platform ? `PF ${stop.platform}` : 'PF —',
        delay: 0,
        delayText: 'On Time',
        status: 'Scheduled',
        runDays: train.runDays || [],
      }
    })

    return {
      station: {
        stationCode: stationInfo.code || cleanCode,
        stationName: stationInfo.name || cleanCode,
        city: stationInfo.city || 'N/A',
      },
      trains: normalizedTrains,
      count: raw.count || normalizedTrains.length,
      dataSource: result.isCached ? 'CACHED' : 'RAILRADAR',
      lastUpdated: new Date(result.cacheTimestamp || Date.now()).toISOString(),
    }
  }

  /**
   * Transform RailRadar live status payload into normalized internal train schema
   */
  transformLiveStatus(liveData, isCached = false, cacheTimestamp = Date.now()) {
    const trainInfo = liveData.train || {}
    const curLoc = liveData.currentLocation || {}
    const prevHalt = liveData.previousHalt || {}
    const nextHalt = liveData.nextHalt || {}
    const rawDelay = liveData.delayMinutes ?? curLoc.delayMinutes ?? 0
    const delayMinutes = Math.max(0, rawDelay)

    const rawRoute = liveData.route || []

    // Map halt stations to timeline
    const timeline = rawRoute.filter((r) => r.isHalt).map((r, idx, arr) => {
      const scheduledTime = r.scheduledArrival
        ? new Date(r.scheduledArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : r.scheduledDeparture
        ? new Date(r.scheduledDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '—'

      const actualTime = r.actualArrival
        ? new Date(r.actualArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : r.actualDeparture
        ? new Date(r.actualDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : scheduledTime

      const delay = r.delayArrival || r.delayDeparture || 0
      const delayText = delay > 0 ? `+${delay} min` : delay < 0 ? `${delay} min` : 'On Time'

      const isCurrent = r.status === 'at-station' || r.stationCode === curLoc.stationCode
      const isComplete = r.status === 'departed' || (curLoc.sequence && r.sequence < curLoc.sequence)

      return {
        sequence: r.sequence,
        station: r.stationName || r.stationCode,
        stationCode: r.stationCode,
        type: idx === 0 ? 'Source' : idx === arr.length - 1 ? 'Destination' : 'Halt',
        status: isCurrent ? 'Current' : isComplete ? 'Departed' : 'Upcoming',
        time: actualTime,
        scheduledTime,
        expectedTime: actualTime,
        delay: delayText,
        delayMinutes: delay,
        complete: isComplete || isCurrent,
        platform: r.platform ? `Platform: ${r.platform}` : 'Platform: —',
        distance: r.distance != null ? `${r.distance} km` : '—',
        speedToNextStationKmph: r.speedToNextStationKmph || null,
      }
    })

    const totalDist = trainInfo.distance || (rawRoute[rawRoute.length - 1]?.distance) || 0
    const coveredDist = curLoc.distanceFromOriginKm || (timeline.find((t) => t.status === 'Current')?.distance ? parseFloat(timeline.find((t) => t.status === 'Current').distance) : 0)
    const remainingDist = Math.max(0, Math.round(totalDist - coveredDist))
    const progress = totalDist > 0 ? Math.min(Math.round((coveredDist / totalDist) * 100), 100) : 0

    const speed = curLoc.status === 'at-station' ? 0 : Math.round(trainInfo.avgSpeed || 75)

    // Compute Source / Destination strings
    const sourceName = trainInfo.source?.name || timeline[0]?.station || 'Origin'
    const sourceCode = trainInfo.source?.code || timeline[0]?.stationCode || 'SRC'
    const destName = trainInfo.destination?.name || timeline[timeline.length - 1]?.station || 'Destination'
    const destCode = trainInfo.destination?.code || timeline[timeline.length - 1]?.stationCode || 'DEST'

    // Status mapping
    const rawStatus = (liveData.status || '').toLowerCase()
    const statusText =
      rawStatus === 'running'
        ? delayMinutes > 15
          ? 'Delayed'
          : 'Running'
        : rawStatus === 'not-started'
        ? 'Not Started'
        : rawStatus === 'completed' || rawStatus === 'arrived'
        ? 'Terminated'
        : 'Running'

    return {
      trainNumber: String(liveData.trainNumber || trainInfo.number),
      trainName: liveData.trainName || trainInfo.name || `Train ${liveData.trainNumber}`,
      type: trainInfo.type || trainInfo.category || 'Express',
      category: trainInfo.category || 'Standard',
      source: `${sourceName} (${sourceCode})`,
      sourceName,
      sourceCode,
      destination: `${destName} (${destCode})`,
      destName,
      destinationCode: destCode,
      currentStation: curLoc.stationName ? `${curLoc.stationName} (${curLoc.stationCode})` : 'En Route',
      currentStationName: curLoc.stationName || 'En Route',
      currentStationCode: curLoc.stationCode || '',
      currentLocationStatus: curLoc.status || 'running',
      nextStation: nextHalt.stationName ? `${nextHalt.stationName} (${nextHalt.stationCode})` : destName,
      nextStationCode: nextHalt.stationCode || destCode,
      previousStation: prevHalt.stationName ? `${prevHalt.stationName} (${prevHalt.stationCode})` : sourceName,
      speed,
      maxSpeed: Math.round(trainInfo.maxSpeed || 130),
      delay: delayMinutes,
      status: statusText,
      progress,
      platform: timeline.find((t) => t.status === 'Current')?.platform || timeline[0]?.platform || 'Platform: —',
      distanceCoveredKm: Math.round(coveredDist),
      distanceRemainingKm: remainingDist,
      totalDistanceKm: Math.round(totalDist),
      duration: trainInfo.duration ? `${Math.floor(trainInfo.duration / 60)}h ${trainInfo.duration % 60}m` : null,
      totalHalts: timeline.length,
      coachPosition: trainInfo.coachPosition || null,
      runDays: trainInfo.runDays || [],
      timeline: timeline.length > 0 ? timeline : [],
      route: rawRoute,
      allHaltStations: timeline.map((t) => ({ name: t.station, code: t.stationCode })),
      lastUpdated: liveData.lastUpdatedAt || new Date(cacheTimestamp).toISOString(),
      dataSource: isCached ? 'CACHED' : 'RAILRADAR',
      isLive: !isCached && (liveData.isLive ?? true),
      trackingMode: liveData.trackingMode || 'real-time',
    }
  }

  /**
   * Transform RailRadar train details payload when train is not actively running
   */
  transformTrainDetails(data, isCached = false, cacheTimestamp = Date.now()) {
    const train = data.train || data
    const rawRoute = data.route || []

    const timeline = rawRoute.filter((r) => r.isHalt).map((r, idx, arr) => ({
      sequence: r.sequence || idx + 1,
      station: r.station?.name || r.stationName || r.station?.code,
      stationCode: r.station?.code || r.stationCode,
      type: idx === 0 ? 'Source' : idx === arr.length - 1 ? 'Destination' : 'Halt',
      status: 'Scheduled',
      time: r.arrival || r.departure || '—',
      scheduledTime: r.arrival || r.departure || '—',
      expectedTime: r.arrival || r.departure || '—',
      delay: 'On Schedule',
      delayMinutes: 0,
      complete: false,
      platform: r.platform ? `Platform: ${r.platform}` : 'Platform: —',
      distance: r.distance != null ? `${r.distance} km` : '—',
    }))

    const sourceName = train.source?.name || timeline[0]?.station || 'Origin'
    const sourceCode = train.source?.code || timeline[0]?.stationCode || 'SRC'
    const destName = train.destination?.name || timeline[timeline.length - 1]?.station || 'Destination'
    const destCode = train.destination?.code || timeline[timeline.length - 1]?.stationCode || 'DEST'

    return {
      trainNumber: String(train.number || train.trainNumber),
      trainName: train.name || train.trainName,
      type: train.type || 'Express',
      category: train.category || 'Standard',
      source: `${sourceName} (${sourceCode})`,
      sourceName,
      sourceCode,
      destination: `${destName} (${destCode})`,
      destName,
      destinationCode: destCode,
      currentStation: 'Not Started / In Yard',
      currentStationName: 'Not Started',
      currentStationCode: '',
      currentLocationStatus: 'not-started',
      nextStation: timeline[1]?.station || destName,
      nextStationCode: timeline[1]?.stationCode || destCode,
      previousStation: 'None',
      speed: 0,
      maxSpeed: Math.round(train.maxSpeed || 110),
      delay: 0,
      status: 'Scheduled',
      progress: 0,
      platform: timeline[0]?.platform || 'Platform: —',
      distanceCoveredKm: 0,
      distanceRemainingKm: Math.round(train.distance || 0),
      totalDistanceKm: Math.round(train.distance || 0),
      duration: train.duration ? `${Math.floor(train.duration / 60)}h ${train.duration % 60}m` : null,
      totalHalts: timeline.length,
      coachPosition: train.coachPosition || null,
      runDays: train.runDays || [],
      timeline,
      route: rawRoute,
      allHaltStations: timeline.map((t) => ({ name: t.station, code: t.stationCode })),
      lastUpdated: new Date(cacheTimestamp).toISOString(),
      dataSource: isCached ? 'CACHED' : 'RAILRADAR',
      isLive: false,
      trackingMode: 'scheduled',
    }
  }
}

export const railRadarService = new RailRadarService()
