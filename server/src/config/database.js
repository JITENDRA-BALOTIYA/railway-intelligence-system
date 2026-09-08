import mongoose from 'mongoose'
import { config } from './env.js'
import { logger } from '../utils/logger.js'
import { Train } from '../models/Train.js'
import { Station } from '../models/Station.js'
import { ETA } from '../models/ETA.js'
import { Delay } from '../models/Delay.js'
import { Alert } from '../models/Alert.js'
import { seedTrains, seedStations, seedETAs, seedDelays, seedAlerts } from '../data/seedData.js'

let isConnected = false
let usingInMemoryFallback = false

export const getDbStatus = () => ({
  isConnected,
  usingInMemoryFallback,
  uri: isConnected ? config.mongodbUri.replace(/:([^:@]{1,})@/, ':***@') : null,
})

// In-memory runtime fallback storage in case MongoDB daemon is unavailable
export const memoryStore = {
  trains: [...seedTrains],
  stations: [...seedStations],
  etas: [...seedETAs],
  delays: [...seedDelays],
  alerts: [...seedAlerts],
}

export const connectDatabase = async () => {
  try {
    mongoose.set('strictQuery', false)
    logger.info(`Attempting MongoDB connection to ${config.mongodbUri}...`)
    
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout for graceful fallback
      connectTimeoutMS: 2500,
    })

    isConnected = true
    usingInMemoryFallback = false
    logger.info('Successfully connected to MongoDB')

    // Seed database if empty
    await seedDatabaseIfEmpty()
  } catch (error) {
    isConnected = false
    usingInMemoryFallback = true
    logger.warn(`MongoDB not available (${error.message}). Activating high-fidelity In-Memory Database Fallback.`)
    logger.info('Application will operate normally with in-memory persistence and Mongoose schema consistency.')
  }
}

async function seedDatabaseIfEmpty() {
  try {
    const trainCount = await Train.countDocuments()
    if (trainCount === 0) {
      logger.info('Database empty. Seeding initial Railway Intelligence data...')
      await Promise.all([
        Train.insertMany(seedTrains),
        Station.insertMany(seedStations),
        ETA.insertMany(seedETAs),
        Delay.insertMany(seedDelays),
        Alert.insertMany(seedAlerts),
      ])
      logger.info('Database seeding completed successfully.')
    }
  } catch (err) {
    logger.error('Error seeding database:', err.message)
  }
}
