import { Train } from '../models/Train.js'
import { memoryStore, getDbStatus } from '../config/database.js'
import { railRadarService } from './railRadarService.js'
import { logger } from '../utils/logger.js'

export const trainService = {
  /**
   * Search trains via RailRadar live API or database query
   */
  async getAllTrains({ search = '', status = '', limit = 50 } = {}) {
    // If no search query provided, return empty array to prevent random train display
    if (!search || search.trim().length === 0) {
      return []
    }

    const term = search.trim()

    // 1. Primary: Search RailRadar autocomplete / live database
    try {
      const liveResults = await railRadarService.searchTrains(term, Number(limit))
      if (liveResults && liveResults.length > 0) {
        return liveResults
      }
    } catch (err) {
      logger.warn(`RailRadar search for "${term}" error: ${err.message}`)
    }

    // 2. Fallback: If DB is connected and contains matching records
    const { isConnected } = getDbStatus()
    if (isConnected) {
      const query = {}
      if (status) query.status = status
      const regex = new RegExp(term, 'i')
      query.$or = [
        { trainNumber: regex },
        { trainName: regex },
        { source: regex },
        { destination: regex },
      ]
      return await Train.find(query).limit(Number(limit)).lean()
    }

    return []
  },

  /**
   * Get train details strictly from RailRadar
   */
  async getTrainByNumber(trainNumber) {
    const num = String(trainNumber).trim()
    if (!num) return null

    try {
      const liveTrain = await railRadarService.getTrainDetails(num)
      if (liveTrain) {
        return liveTrain
      }
    } catch (err) {
      logger.warn(`RailRadar fetch for train ${num} failed: ${err.message}`)
    }

    return null
  },

  /**
   * Get live running telemetry for a train strictly from RailRadar
   */
  async getLiveStatus(trainNumber, bypassCache = false) {
    const num = String(trainNumber).trim()
    if (!num) return null

    try {
      const liveStatus = await railRadarService.getLiveStatus(num, bypassCache)
      if (liveStatus) {
        return liveStatus
      }
    } catch (err) {
      logger.warn(`RailRadar live status for ${num} error: ${err.message}`)
    }

    return null
  },
}

