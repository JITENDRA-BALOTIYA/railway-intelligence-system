import { useState, useEffect, useCallback } from 'react'
import { etaService } from '../services/etaService.js'

export const useETAPrediction = (trainNumber) => {
  const [prediction, setPrediction] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchETA = useCallback(async () => {
    if (!trainNumber) return
    try {
      setLoading(true)
      const [predData, historyData] = await Promise.all([
        etaService.getETA(trainNumber),
        etaService.getETAHistory(trainNumber).catch(() => []),
      ])
      setPrediction(predData)
      setHistory(historyData)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch ETA prediction')
    } finally {
      setLoading(false)
    }
  }, [trainNumber])

  useEffect(() => {
    fetchETA()
  }, [fetchETA])

  return { prediction, history, loading, error, refresh: fetchETA }
}
