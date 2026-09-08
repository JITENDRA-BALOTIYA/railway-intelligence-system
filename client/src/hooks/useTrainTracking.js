import { useState, useEffect, useCallback } from 'react'
import { trainService } from '../services/trainService.js'

export const useTrainTracking = (trainNumber) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTracking = useCallback(async () => {
    if (!trainNumber) return
    try {
      const result = await trainService.getLiveTracking(trainNumber)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch tracking data')
    } finally {
      setLoading(false)
    }
  }, [trainNumber])

  useEffect(() => {
    setLoading(true)
    fetchTracking()

    // Polling interval for live telemetry simulation (every 15s)
    const interval = setInterval(fetchTracking, 15000)
    return () => clearInterval(interval)
  }, [fetchTracking])

  return { data, loading, error, refresh: fetchTracking }
}
