import { ETA } from '../models/ETA.js'
import { memoryStore, getDbStatus } from '../config/database.js'
import { trainService } from './trainService.js'
import { calculateDynamicETA } from '../utils/etaCalculator.js'

export const etaService = {
  /**
   * Primary ETA Engine prediction pipeline
   * Modular design allows swapping calculation core with ML inference or live API adapter
   */
  async getPrediction(trainNumber) {
    const cleanNumber = String(trainNumber).trim()
    const train = (await trainService.getLiveStatus(cleanNumber)) || (await trainService.getTrainByNumber(cleanNumber))

    if (!train) return null

    // Check if stored ETA baseline exists in DB or memoryStore
    const { isConnected } = getDbStatus()
    let storedETA = null
    if (isConnected) {
      storedETA = await ETA.findOne({ trainNumber: cleanNumber }).lean()
    } else {
      storedETA = memoryStore.etas.find((e) => e.trainNumber === cleanNumber)
    }

    // Determine upcoming terminus/destination stop
    const terminus = train.timeline?.find((s) => s.type === 'Destination') || {
      station: train.destination || train.destName || 'Destination',
      scheduledTime: storedETA?.scheduledArrival || '10:00 AM',
    }

    // Intermediate remaining halts count
    const remainingStops = (train.timeline || []).filter((s) => !s.complete).length

    // Extract visibility number from string (e.g., "180 m" -> 180)
    const visibilityMatch = (train.weather?.visibility || '1000').match(/\d+/)
    const visibilityMeters = visibilityMatch ? parseInt(visibilityMatch[0], 10) : 1000

    // Compute dynamic ETA using the intelligent multi-factor algorithm
    const dynamicCalculation = calculateDynamicETA({
      scheduledArrivalStr: terminus.scheduledTime || storedETA?.scheduledArrival || '10:00 AM',
      currentDelayMinutes: train.delay || 0,
      distanceRemainingKm: train.distanceRemainingKm || 500,
      currentSpeedKmH: train.speed || 80,
      weatherCondition: train.weather?.condition || 'Clear',
      visibilityMeters,
      routeCongestionLevel: storedETA?.routeCongestion || (train.delay > 30 ? 'Severe' : train.delay > 15 ? 'High' : 'Moderate'),
      intermediateStopsCount: remainingStops || 3,
      dwellTimePerStopMinutes: 3,
    })

    return {
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      targetStation: terminus.station,
      platform: train.platform,
      scheduledArrival: dynamicCalculation.scheduledArrival,
      predictedArrival: dynamicCalculation.predictedArrival,
      currentDelayMinutes: train.delay,
      projectedDelayMinutes: dynamicCalculation.delayMinutes,
      confidence: dynamicCalculation.confidence,
      confidenceLabel: dynamicCalculation.confidenceLabel,
      predictionWindow: dynamicCalculation.predictionWindow,
      recoveryEstimatedMinutes: dynamicCalculation.recoveryEstimatedMinutes,
      stationDwellTimeMinutes: dynamicCalculation.stationDwellTimeMinutes,
      routeCongestion: dynamicCalculation.routeCongestion,
      weatherImpact: dynamicCalculation.weatherImpact,
      signalImpact: dynamicCalculation.signalImpact,
      factors: dynamicCalculation.factors,
      explanation: `Train ${train.trainNumber} (${train.trainName}) is running with a current delay of ${train.delay} min. Taking into account route congestion (${dynamicCalculation.routeCongestion}) and ${dynamicCalculation.weatherImpact.toLowerCase()} weather friction, arrival at ${terminus.station} is projected within ${dynamicCalculation.predictionWindow.start} - ${dynamicCalculation.predictionWindow.end} with an estimated recovery of ${dynamicCalculation.recoveryEstimatedMinutes} min.`,
      lastUpdated: new Date().toISOString(),
    }
  },

  /**
   * Fetch historical prediction vs actual timeline points for Recharts
   */
  async getPredictionHistory(trainNumber) {
    const cleanNumber = String(trainNumber).trim()
    const { isConnected } = getDbStatus()

    let storedETA = null
    if (isConnected) {
      storedETA = await ETA.findOne({ trainNumber: cleanNumber }).lean()
    } else {
      storedETA = memoryStore.etas.find((e) => e.trainNumber === cleanNumber)
    }

    if (storedETA && storedETA.history && storedETA.history.length > 0) {
      return storedETA.history
    }

    // Default fallback history
    return [
      { time: '06:00 AM', scheduled: 600, predicted: 600, actual: 600 },
      { time: '08:00 AM', scheduled: 600, predicted: 610, actual: 608 },
      { time: '10:00 AM', scheduled: 600, predicted: 622, actual: 620 },
      { time: '12:00 PM', scheduled: 600, predicted: 618, actual: 615 },
    ]
  },
}
