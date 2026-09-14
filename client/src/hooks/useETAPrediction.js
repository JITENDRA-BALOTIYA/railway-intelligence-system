import { useState, useEffect, useCallback } from 'react'
import { etaService } from '../services/etaService.js'

export const useETAPrediction = (trainNumber) => {
  const [prediction, setPrediction] = useState(null)
  const [fullData, setFullData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [fullLoading, setFullLoading] = useState(false)
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

  const fetchFull = useCallback(async (num) => {
    const tn = num || trainNumber
    if (!tn) return
    try {
      setFullLoading(true)
      setError(null)
      const data = await etaService.getFullETA(tn)
      setFullData(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch full ETA data')
      setFullData(null)
    } finally {
      setFullLoading(false)
    }
  }, [trainNumber])

  useEffect(() => {
    if (trainNumber) {
      fetchFull(trainNumber)
    }
  }, [trainNumber, fetchFull])

  return { prediction, fullData, history, loading, fullLoading, error, refresh: fetchETA, refreshFull: fetchFull }
}
