import { useState, useEffect } from 'react'
import { stationService } from '../services/stationService.js'

export const useStationCrowd = (stationCode = 'NDLS') => {
  const [stationData, setStationData] = useState(null)
  const [allStations, setAllStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const loadStations = async () => {
      try {
        setLoading(true)
        const [stations, crowd] = await Promise.all([
          stationService.getStations(),
          stationService.getStationCrowd(stationCode),
        ])
        if (isMounted) {
          setAllStations(stations || [])
          setStationData(crowd)
          setError(null)
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to fetch station crowd info')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadStations()
    return () => {
      isMounted = false
    }
  }, [stationCode])

  return { stationData, allStations, loading, error }
}
