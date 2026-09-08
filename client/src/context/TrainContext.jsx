import { createContext, useContext, useState, useEffect } from 'react'
import { trainService } from '../services/trainService.js'

const TrainContext = createContext(null)

export const TrainProvider = ({ children }) => {
  const [selectedTrainNumber, setSelectedTrainNumber] = useState('12301')
  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTrains = async () => {
    try {
      setLoading(true)
      const data = await trainService.getTrains()
      setTrains(data || [])
      if (data?.length && !data.find((t) => t.trainNumber === selectedTrainNumber)) {
        setSelectedTrainNumber(data[0].trainNumber)
      }
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load trains')
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchTrains()
  }, [])

  const selectedTrain = trains.find((t) => t.trainNumber === selectedTrainNumber) || trains[0] || null

  return (
    <TrainContext.Provider
      value={{
        trains,
        selectedTrainNumber,
        selectedTrain,
        setSelectedTrainNumber,
        loading,
        error,
        refreshTrains: fetchTrains,
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
