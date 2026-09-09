import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { trainService } from '../services/trainService.js'

const TrainContext = createContext(null)

const RECENT_SEARCHES_KEY = 'railradar_recent_searches'

export const TrainProvider = ({ children }) => {
  const [selectedTrain, setSelectedTrain] = useState(null)
  const [selectedTrainNumber, setSelectedTrainNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
      return saved ? JSON.parse(saved) : ['12301', '12951', '12002']
    } catch {
      return ['12301', '12951', '12002']
    }
  })

  // Save to recent searches shortcut list
  const addRecentSearch = useCallback((trainNum) => {
    const cleanNum = String(trainNum).trim()
    if (!cleanNum) return
    setRecentSearches((prev) => {
      const filtered = prev.filter((n) => n !== cleanNum)
      const updated = [cleanNum, ...filtered].slice(0, 8)
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to persist recent searches:', e)
      }
      return updated
    })
  }, [])

  const removeRecentSearch = useCallback((trainNum) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((n) => n !== trainNum)
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to update recent searches:', e)
      }
      return updated
    })
  }, [])

  /**
   * Primary search function for finding and loading a train from RailRadar
   */
  const searchTrain = useCallback(async (trainNumber, bypassCache = false) => {
    const cleanNumber = String(trainNumber || '').trim()
    if (!cleanNumber) {
      setSelectedTrain(null)
      setSelectedTrainNumber('')
      setError(null)
      return null
    }

    if (bypassCache) {
      setIsRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const data = await trainService.getLiveTracking(cleanNumber, {
        refresh: bypassCache ? 'true' : undefined,
      })

      if (data && data.trainNumber) {
        setSelectedTrain(data)
        setSelectedTrainNumber(String(data.trainNumber))
        addRecentSearch(String(data.trainNumber))
        setError(null)
        return data
      } else {
        setSelectedTrain(null)
        setSelectedTrainNumber(cleanNumber)
        setError(`Train ${cleanNumber} not found. Please check the train number and try again.`)
        return null
      }
    } catch (err) {
      setSelectedTrain(null)
      setSelectedTrainNumber(cleanNumber)
      const message =
        err.statusCode === 404
          ? `Train ${cleanNumber} not found. Please check the train number and try again.`
          : err.message || 'Unable to fetch live railway data. Please check your connection and retry.'
      setError(message)
      return null
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [addRecentSearch])

  /**
   * Refresh currently selected train live status
   */
  const refreshTrain = useCallback(async () => {
    if (selectedTrainNumber) {
      return await searchTrain(selectedTrainNumber, true)
    }
    return null
  }, [selectedTrainNumber, searchTrain])

  const clearSelectedTrain = useCallback(() => {
    setSelectedTrain(null)
    setSelectedTrainNumber('')
    setError(null)
  }, [])

  return (
    <TrainContext.Provider
      value={{
        selectedTrain,
        selectedTrainNumber,
        setSelectedTrain,
        setSelectedTrainNumber: (num) => searchTrain(num),
        searchTrain,
        refreshTrain,
        clearSelectedTrain,
        loading,
        isRefreshing,
        error,
        recentSearches,
        removeRecentSearch,
      }}
    >
      {children}
    </TrainContext.Provider>
  )
}

export const useTrain = () => {
  const context = useContext(TrainContext)
  if (!context) {
    throw new Error('useTrain must be used within a TrainProvider')
  }
  return context
}
