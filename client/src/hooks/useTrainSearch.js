import { useState, useEffect, useMemo } from 'react'
import { trainService } from '../services/trainService.js'

export const useTrainSearch = (initialSearch = '') => {
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState('All')
  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetchTrains = async () => {
      try {
        setLoading(true)
        const data = await trainService.getTrains()
        if (isMounted) {
          setTrains(data || [])
          setError(null)
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to fetch trains')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchTrains()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredTrains = useMemo(() => {
    let result = trains
    if (statusFilter !== 'All') {
      result = result.filter((t) => t.status?.toLowerCase() === statusFilter.toLowerCase())
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter(
        (t) =>
          t.trainNumber?.toLowerCase().includes(term) ||
          t.trainName?.toLowerCase().includes(term) ||
          t.source?.toLowerCase().includes(term) ||
          t.destination?.toLowerCase().includes(term) ||
          t.currentStation?.toLowerCase().includes(term),
      )
    }
    return result
  }, [trains, searchTerm, statusFilter])

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    trains: filteredTrains,
    rawTrains: trains,
    loading,
    error,
  }
}
