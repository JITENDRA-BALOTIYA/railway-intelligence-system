import { useState, useEffect } from 'react'

const STORAGE_KEY = 'railway_saved_trips'

export const useSavedTrips = () => {
  const [savedTrips, setSavedTrips] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : ['12301', '22436']
    } catch {
      return ['12301', '22436']
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTrips))
    } catch (e) {
      console.warn('Failed to persist saved trips:', e)
    }
  }, [savedTrips])

  const toggleSaveTrip = (trainNumber) => {
    const num = String(trainNumber)
    setSavedTrips((prev) =>
      prev.includes(num) ? prev.filter((id) => id !== num) : [...prev, num],
    )
  }

  const isSaved = (trainNumber) => savedTrips.includes(String(trainNumber))

  return { savedTrips, toggleSaveTrip, isSaved }
}
