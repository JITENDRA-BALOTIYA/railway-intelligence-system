import {
  railwayDataProvider,
  INDIAN_RAILWAY_STATIONS,
  RAILWAY_CORRIDOR_TOPOLOGY,
} from '../providers/railwayProvider.js'
import { trainService } from './trainService.js'

// Haversine formula for real geographic distance in kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

function getCongestionLevel(percentage) {
  if (percentage >= 85) return { label: 'Critical', color: '#ef4444', class: 'critical' }
  if (percentage >= 70) return { label: 'Heavy', color: '#f97316', class: 'heavy' }
  if (percentage >= 45) return { label: 'Moderate', color: '#eab308', class: 'moderate' }
  return { label: 'Normal', color: '#10b981', class: 'normal' }
}

export const routeService = {
  /**
   * Find stations along corridor between origin and destination
   */
  resolveStationPath(fromCode, toCode) {
    const from = fromCode.toUpperCase()
    const to = toCode.toUpperCase()

    // 1. Search in defined corridors
    for (const corridor of RAILWAY_CORRIDOR_TOPOLOGY) {
      const idxFrom = corridor.stations.indexOf(from)
      const idxTo = corridor.stations.indexOf(to)

      if (idxFrom !== -1 && idxTo !== -1) {
        if (idxFrom < idxTo) {
          return corridor.stations.slice(idxFrom, idxTo + 1)
        } else {
          return corridor.stations.slice(idxTo, idxFrom + 1).reverse()
        }
      }
    }

    // 2. Multi-hop corridor stitching (e.g. from NDLS to BSB via DDU, or NDLS to LKO via CNB)
    if (from === 'NDLS' && to === 'BSB') {
      return ['NDLS', 'GZB', 'ALJN', 'TDL', 'CNB', 'PRYJ', 'DDU', 'BSB']
    }
    if (from === 'NDLS' && to === 'LKO') {
      return ['NDLS', 'GZB', 'ALJN', 'TDL', 'CNB', 'LKO']
    }
    if (from === 'CNB' && to === 'HWH') {
      return ['CNB', 'PRYJ', 'DDU', 'GAYA', 'DHN', 'ASN', 'DGR', 'HWH']
    }
    if (from === 'JP' && to === 'MMCT') {
      return ['JP', 'AII', 'ADI', 'BRC', 'ST', 'MMCT']
    }

    // 3. Fallback: if both exist in master registry, return direct pair
    if (INDIAN_RAILWAY_STATIONS[from] && INDIAN_RAILWAY_STATIONS[to]) {
      return [from, to]
    }

    return null
  },

  /**
   * Get full realistic route intelligence
   */
  async getRoute(fromCode, toCode) {
    const from = String(fromCode || '').trim().toUpperCase()
    const to = String(toCode || '').trim().toUpperCase()

    if (!from || !to) {
      throw new Error('Both FROM and TO station codes are required')
    }

    const fromStation = await railwayDataProvider.getStation(from)
    if (!fromStation) {
      const err = new Error(`Station code not found: ${from}`)
      err.statusCode = 404
      throw err
    }

    const toStation = await railwayDataProvider.getStation(to)
    if (!toStation) {
      const err = new Error(`Station code not found: ${to}`)
      err.statusCode = 404
      throw err
    }

    if (from === to) {
      const err = new Error('Origin and destination stations must be different')
      err.statusCode = 400
      throw err
    }

    const stationCodes = this.resolveStationPath(from, to) || [from, to]

    // Hydrate all station nodes
    const stations = await Promise.all(
      stationCodes.map(async (code) => {
        const s = await railwayDataProvider.getStation(code)
        return (
          s || {
            stationCode: code,
            stationName: code,
            latitude: 28.6139,
            longitude: 77.209,
            platforms: 4,
            occupiedPlatforms: 2,
            averageDelayMinutes: 5,
            congestionPercentage: 50,
            status: 'operational',
            dataSource: 'DEMO',
          }
        )
      }),
    )

    // Build realistic track segments
    let totalDistanceKm = 0
    let cumulativeDelayMinutes = 0
    let criticalCount = 0
    const trackSegments = []

    for (let i = 0; i < stations.length - 1; i++) {
      const stn1 = stations[i]
      const stn2 = stations[i + 1]

      const dist = calculateDistanceKm(
        stn1.latitude,
        stn1.longitude,
        stn2.latitude,
        stn2.longitude,
      )
      totalDistanceKm += dist

      // Compute section congestion from adjacent stations
      const avgCongestion = Math.round(
        (stn1.congestionPercentage + stn2.congestionPercentage) / 2,
      )
      const level = getCongestionLevel(avgCongestion)
      if (level.class === 'critical') criticalCount++

      const estDelay = Math.round(
        (stn1.averageDelayMinutes + stn2.averageDelayMinutes) / 2,
      )
      cumulativeDelayMinutes += estDelay

      const speedLimit = avgCongestion > 85 ? 65 : avgCongestion > 70 ? 85 : 110

      trackSegments.push({
        id: `SEC-${stn1.stationCode}-${stn2.stationCode}`,
        section: `${stn1.stationCode} → ${stn2.stationCode}`,
        from: stn1.stationCode,
        fromName: stn1.stationName,
        to: stn2.stationCode,
        toName: stn2.stationName,
        distanceKm: dist,
        activeTrains: Math.max(1, Math.round((dist / 35) * (avgCongestion / 60))),
        averageSpeedKmph: speedLimit,
        sectionCongestionPercentage: avgCongestion,
        congestionLevel: level.label,
        congestionColor: level.color,
        signalStatus:
          avgCongestion > 85
            ? 'Throttled (Caution Hold)'
            : avgCongestion > 70
            ? 'Warning'
            : 'Normal (Clear)',
        trackStatus:
          avgCongestion > 85
            ? 'Speed Restricted (60 km/h)'
            : 'Normal Double Line',
        estimatedDelayMinutes: estDelay,
        capacityUtilization: `${Math.min(125, avgCongestion + 12)}%`,
        coordinates: [
          [stn1.latitude, stn1.longitude],
          [stn2.latitude, stn2.longitude],
        ],
      })
    }

    // Active trains running along this corridor
    const allTrains = await trainService.getAllTrains({ limit: 20 })
    const activeTrains = []

    // Seed / simulate realistic moving trains along the route if search returns few
    const trainPrototypes = [
      {
        trainNumber: '12301',
        trainName: 'Howrah Rajdhani Express',
        direction: 'Down Line (Eastbound)',
        speed: 92,
        delay: 24,
        platform: 'PF 10',
        segmentIndex: Math.min(1, trackSegments.length - 1),
      },
      {
        trainNumber: '22436',
        trainName: 'Vande Bharat Express',
        direction: 'Down Line (Eastbound)',
        speed: 128,
        delay: 0,
        platform: 'PF 1',
        segmentIndex: Math.min(2, trackSegments.length - 1),
      },
      {
        trainNumber: '12004',
        trainName: 'Lucknow Shatabdi Express',
        direction: 'Down Line',
        speed: 104,
        delay: 11,
        platform: 'PF 4',
        segmentIndex: Math.min(0, trackSegments.length - 1),
      },
      {
        trainNumber: 'FG-8821',
        trainName: 'BOXN Freight Goods (Thermal Coal)',
        direction: 'Down Line',
        speed: 38,
        delay: 48,
        platform: 'Goods Line 3',
        segmentIndex: Math.min(3, trackSegments.length - 1),
      },
    ]

    trainPrototypes.forEach((proto, idx) => {
      if (trackSegments[proto.segmentIndex]) {
        const seg = trackSegments[proto.segmentIndex]
        const fromStn = stations[proto.segmentIndex]
        const toStn = stations[proto.segmentIndex + 1]

        // Interpolate position along the segment
        const ratio = (idx + 1) * 0.22
        const curLat = fromStn.latitude + (toStn.latitude - fromStn.latitude) * ratio
        const curLng = fromStn.longitude + (toStn.longitude - fromStn.longitude) * ratio

        activeTrains.push({
          trainNumber: proto.trainNumber,
          trainName: proto.trainName,
          currentStation: fromStn.stationCode,
          currentStationName: fromStn.stationName,
          nextStation: toStn.stationCode,
          nextStationName: toStn.stationName,
          currentSpeedKmph: proto.speed,
          delayMinutes: proto.delay,
          platform: proto.platform,
          direction: proto.direction,
          position: [Number(curLat.toFixed(4)), Number(curLng.toFixed(4))],
          eta: '19:45',
          lastUpdated: new Date().toLocaleTimeString(),
        })
      }
    })

    // Corridor summary metrics
    const avgRouteCongestion = Math.round(
      stations.reduce((acc, s) => acc + s.congestionPercentage, 0) / stations.length,
    )
    const avgRouteDelay = Math.round(
      stations.reduce((acc, s) => acc + s.averageDelayMinutes, 0) / stations.length,
    )

    // Dynamic corridor alerts
    const alerts = []
    if (criticalCount > 0) {
      alerts.push({
        id: 'ALT-CRIT-1',
        type: 'CRITICAL',
        title: `High Congestion Detected in ${criticalCount} Block Section(s)`,
        description: `Severe line saturation on ${from}-${to} corridor exceeding 85% capacity threshold.`,
      })
    }
    if (avgRouteDelay > 15) {
      alerts.push({
        id: 'ALT-WARN-1',
        type: 'WARNING',
        title: `Cumulative Delay Propagation: +${avgRouteDelay} min`,
        description: `Visual signal throttling and headway spacing active due to dense fog/congestion.`,
      })
    }
    alerts.push({
      id: 'ALT-INFO-1',
      type: 'INFO',
      title: 'Dedicated Freight Corridor (DFC) Interconnection Active',
      description: 'Dynamic automated rerouting available to divert goods rakes and relieve passenger lines.',
    })

    const isLive = stations.some((s) => s.dataSource === 'LIVE')

    return {
      success: true,
      route: {
        from: fromStation.stationCode,
        fromName: fromStation.stationName,
        to: toStation.stationCode,
        toName: toStation.stationName,
        title: `${fromStation.stationName} → ${toStation.stationName}`,
        totalStations: stations.length,
        totalDistanceKm,
        activeTrainsCount: activeTrains.length,
        averageDelayMinutes: avgRouteDelay,
        routeCongestionPercentage: avgRouteCongestion,
        criticalSectionsCount: criticalCount,
        networkStatus: criticalCount > 0 ? 'Congestion Warning' : 'Operational',
        stations,
        trackSegments,
        activeTrains,
        alerts,
        dataSource: isLive ? 'LIVE' : 'DEMO',
        lastUpdated: new Date().toISOString(),
      },
    }
  },

  /**
   * Station status endpoint
   */
  async getStationStatus(stationCode) {
    const clean = String(stationCode || '').trim().toUpperCase()
    const stn = await railwayDataProvider.getStation(clean)
    if (!stn) {
      const err = new Error(`Station code not found: ${clean}`)
      err.statusCode = 404
      throw err
    }

    return {
      stationCode: stn.stationCode,
      stationName: stn.stationName,
      city: stn.city,
      state: stn.state,
      zone: stn.zone,
      division: stn.division,
      latitude: stn.latitude,
      longitude: stn.longitude,
      status: stn.status,
      congestionPercentage: stn.congestionPercentage,
      platforms: stn.platforms,
      occupiedPlatforms: stn.occupiedPlatforms,
      incomingTrainsCount: stn.incomingTrainsCount,
      outgoingTrainsCount: stn.outgoingTrainsCount,
      averageDelayMinutes: stn.averageDelayMinutes,
      passengerDensity: stn.passengerDensity,
      freightTraffic: stn.freightTraffic,
      oheStatus: stn.oheStatus,
      signalStatus: stn.signalStatus,
      lastUpdated: stn.lastUpdated || new Date().toISOString(),
      dataSource: stn.dataSource || 'DEMO',
    }
  },
}
