import { Train } from '../models/Train.js'
import { memoryStore, getDbStatus } from '../config/database.js'
import { railRadarService } from './railRadarService.js'
import { logger } from '../utils/logger.js'

export const trainService = {
  /**
   * Fetch all trains with optional query filters (search, status, limit)
   */
  async getAllTrains({ search = '', status = '', limit = 50 } = {}) {
    const { isConnected } = getDbStatus()
    let results = []

    if (isConnected) {
      const query = {}
      if (status) query.status = status
      if (search) {
        const regex = new RegExp(search, 'i')
        query.$or = [
          { trainNumber: regex },
          { trainName: regex },
          { source: regex },
          { destination: regex },
        ]
      }
      results = await Train.find(query).limit(Number(limit)).lean()
    } else {
      // In-memory fallback
      results = [...memoryStore.trains]
      if (status) {
        results = results.filter((t) => t.status.toLowerCase() === status.toLowerCase())
      }
      if (search) {
        const term = search.toLowerCase()
        results = results.filter(
          (t) =>
            t.trainNumber.toLowerCase().includes(term) ||
            t.trainName.toLowerCase().includes(term) ||
            t.source.toLowerCase().includes(term) ||
            t.destination.toLowerCase().includes(term),
        )
      }
    }

    // If search term provided and local results are few, supplement with RailRadar live search
    if (search && search.trim().length >= 3 && results.length < 5) {
      try {
        const liveSearchResults = await railRadarService.searchTrains(search, 10)
        if (liveSearchResults && liveSearchResults.length > 0) {
          const existingNumbers = new Set(results.map((r) => r.trainNumber))
          for (const lr of liveSearchResults) {
            if (!existingNumbers.has(lr.trainNumber)) {
              results.push(lr)
              existingNumbers.add(lr.trainNumber)
            }
          }
        }
      } catch (err) {
        logger.warn(`RailRadar search supplement error: ${err.message}`)
      }
    }

    return results.slice(0, Number(limit))
  },

  /**
   * Get train details by trainNumber
   */
  async getTrainByNumber(trainNumber) {
    const num = String(trainNumber).trim()
    const { isConnected } = getDbStatus()

    let train = null
    if (isConnected) {
      train = await Train.findOne({ trainNumber: num }).lean()
    } else {
      train = memoryStore.trains.find((t) => t.trainNumber === num) || null
    }

    // If not in local store, try fetching live from RailRadar API
    if (!train) {
      try {
        const liveTrain = await railRadarService.getTrainDetails(num)
        if (liveTrain) {
          return liveTrain
        }
      } catch (err) {
        logger.warn(`RailRadar fetch for train ${num} failed: ${err.message}`)
      }
    }

    return train
  },

  /**
   * Get live telemetry and status for train
   */
  async getLiveStatus(trainNumber) {
    const num = String(trainNumber).trim()

    // 1. Try fetching real-time live telemetry from RailRadar
    try {
      const liveStatus = await railRadarService.getLiveStatus(num)
      if (liveStatus) {
        return liveStatus
      }
    } catch (err) {
      logger.warn(`RailRadar live status for ${num} failed, using local fallback: ${err.message}`)
    }

    // 2. Fallback to local store with live jitter
    const train = await this.getTrainByNumber(num)
    if (!train) return null

    const speedJitter = Math.floor(Math.random() * 5) - 2
    const currentSpeed = Math.max(0, train.speed + speedJitter)

    return {
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      status: train.status,
      speed: currentSpeed,
      delay: train.delay,
      currentStation: train.currentStation,
      nextStation: train.nextStation,
      progress: train.progress,
      platform: train.platform,
      weather: train.weather,
      crowd: train.crowd,
      timeline: train.timeline,
      lastTelemetryTimestamp: new Date().toISOString(),
    }
  },
}
