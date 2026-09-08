/**
 * Railway ETA Engine - Dynamic Multi-Factor Arrival Predictor
 * Computes calibrated arrival estimates and confidence intervals
 * based on speed, dwell buffers, corridor congestion, weather, and signal conditions.
 */

// Helper to convert "HH:MM AM/PM" to minutes from midnight
export const timeStringToMinutes = (timeStr) => {
  if (!timeStr) return 0
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i)
  if (!match) return 0

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const meridiem = match[3] ? match[3].toUpperCase() : null

  if (meridiem === 'PM' && hours < 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0

  return (hours * 60 + minutes) % (24 * 60)
}

// Helper to convert minutes from midnight to "HH:MM AM/PM"
export const minutesToTimeString = (totalMinutes) => {
  let mins = Math.round(totalMinutes) % (24 * 60)
  if (mins < 0) mins += 24 * 60

  let hours = Math.floor(mins / 60)
  const m = mins % 60
  const meridiem = hours >= 12 ? 'PM' : 'AM'

  if (hours > 12) hours -= 12
  if (hours === 0) hours = 12

  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(hours)}:${pad(m)} ${meridiem}`
}

/**
 * Calculates dynamic ETA with realistic railway dynamics
 */
export const calculateDynamicETA = ({
  scheduledArrivalStr,
  currentDelayMinutes = 0,
  distanceRemainingKm = 500,
  currentSpeedKmH = 80,
  weatherCondition = 'Clear',
  visibilityMeters = 1000,
  routeCongestionLevel = 'Moderate', // Low, Moderate, High, Severe
  intermediateStopsCount = 3,
  dwellTimePerStopMinutes = 3,
}) => {
  const scheduledMinutes = timeStringToMinutes(scheduledArrivalStr)

  // 1. Weather Impact Calculation
  let weatherImpact = 'None'
  let weatherDelayPenalty = 0
  if (visibilityMeters < 150 || weatherCondition.toLowerCase().includes('dense fog')) {
    weatherImpact = 'Severe'
    weatherDelayPenalty = Math.round(distanceRemainingKm * 0.035) // Fog speed ceiling
  } else if (visibilityMeters < 400 || weatherCondition.toLowerCase().includes('fog')) {
    weatherImpact = 'Moderate'
    weatherDelayPenalty = Math.round(distanceRemainingKm * 0.018)
  } else if (visibilityMeters < 800) {
    weatherImpact = 'Low'
    weatherDelayPenalty = Math.round(distanceRemainingKm * 0.008)
  }

  // 2. Route Congestion Coefficient
  const congestionMap = {
    Low: { multiplier: 0.95, penalty: 0, label: 'Low' },
    Moderate: { multiplier: 1.05, penalty: 4, label: 'Moderate' },
    High: { multiplier: 1.2, penalty: 12, label: 'High' },
    Severe: { multiplier: 1.4, penalty: 25, label: 'Severe' },
  }
  const congestion = congestionMap[routeCongestionLevel] || congestionMap.Moderate

  // 3. Junction Signal Interlocking Impact
  let signalImpact = 'Low'
  let signalPenalty = Math.min(intermediateStopsCount * 2, 16)
  if (congestion.label === 'High' || congestion.label === 'Severe') {
    signalImpact = 'Moderate'
    signalPenalty += 8
  }

  // 4. Station Dwell Time Impact
  const totalDwellMinutes = intermediateStopsCount * dwellTimePerStopMinutes

  // 5. Recovery Potential Buffer
  // Higher speed trains on open tracks can recover some delay (up to 15-20% of current delay)
  let recoveryEstimatedMinutes = 0
  if (currentDelayMinutes > 5 && currentSpeedKmH >= 75) {
    const recoveryFactor = currentSpeedKmH > 100 ? 0.25 : 0.15
    recoveryEstimatedMinutes = Math.min(Math.round(currentDelayMinutes * recoveryFactor), 18)
  }

  // 6. Net Projected Delay
  const projectedDelayMinutes = Math.max(
    0,
    currentDelayMinutes + weatherDelayPenalty + congestion.penalty + Math.round(signalPenalty * 0.5) - recoveryEstimatedMinutes,
  )

  // 7. Arrival Window Calculation
  const predictedArrivalMinutes = scheduledMinutes + projectedDelayMinutes
  const windowSpread = Math.max(4, Math.round(projectedDelayMinutes * 0.15) + (weatherImpact === 'Severe' ? 10 : 3))
  const windowStart = minutesToTimeString(predictedArrivalMinutes - windowSpread)
  const windowEnd = minutesToTimeString(predictedArrivalMinutes + windowSpread)

  // 8. Confidence Score (0-100)
  // Distance remaining, weather severity, and congestion affect certainty
  let confidence = 95
  if (distanceRemainingKm > 800) confidence -= 8
  else if (distanceRemainingKm > 400) confidence -= 4

  if (weatherImpact === 'Severe') confidence -= 14
  else if (weatherImpact === 'Moderate') confidence -= 6

  if (congestion.label === 'Severe') confidence -= 10
  else if (congestion.label === 'High') confidence -= 5

  if (currentDelayMinutes > 45) confidence -= 5
  confidence = Math.max(50, Math.min(98, confidence))

  // 9. Attributed Factors Breakdown
  const factors = [
    {
      name: 'Corridor Traffic Congestion',
      impact: Math.min(100, Math.round(congestion.penalty * 3.5 + 20)),
      level: congestion.label,
    },
    {
      name: 'Station Dwell Buffer',
      impact: Math.min(100, totalDwellMinutes * 4),
      level: totalDwellMinutes > 15 ? 'Extended' : 'Nominal',
    },
    {
      name: 'Weather & Visibility Restriction',
      impact: Math.min(100, weatherDelayPenalty * 3),
      level: weatherImpact,
    },
    {
      name: 'Signal Interlocking Clearance',
      impact: Math.min(100, signalPenalty * 4),
      level: signalImpact,
    },
  ]

  if (recoveryEstimatedMinutes > 0) {
    factors.push({
      name: 'Section Speed Recovery Allowance',
      impact: -recoveryEstimatedMinutes * 3,
      level: `-${recoveryEstimatedMinutes} min anticipated recovery`,
    })
  }

  return {
    scheduledArrival: scheduledArrivalStr,
    predictedArrival: minutesToTimeString(predictedArrivalMinutes),
    delayMinutes: projectedDelayMinutes,
    confidence,
    confidenceLabel: confidence >= 85 ? 'High confidence' : confidence >= 70 ? 'Moderate confidence' : 'Low confidence',
    predictionWindow: { start: windowStart, end: windowEnd },
    recoveryEstimatedMinutes,
    stationDwellTimeMinutes: totalDwellMinutes,
    routeCongestion: congestion.label,
    weatherImpact,
    signalImpact,
    factors,
  }
}
