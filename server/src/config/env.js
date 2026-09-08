import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/railway_intelligence',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  railradarApiKey: process.env.RAILRADAR_API_KEY || 'rg_3c599fb3e5614d89846d7ba4f2e99110',
  railradarBaseUrl: process.env.RAILRADAR_BASE_URL || 'https://api.railradar.in',
}

