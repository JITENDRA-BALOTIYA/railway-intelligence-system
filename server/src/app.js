import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config } from './config/env.js'
import { apiRouter } from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import { logger } from './utils/logger.js'

const app = express()

// Security headers with Helmet
app.use(helmet())

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching CLIENT_URL
      if (!origin || origin === config.clientUrl || origin.startsWith('http://localhost:')) {
        callback(null, true)
      } else {
        callback(null, true) // Permissive for local dev environments
      }
    },
    credentials: true,
  }),
)

// Global API Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
})
app.use('/api', limiter)

// Body parsers
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Request logger
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.originalUrl}`)
  next()
})

// Mount API routes
app.use('/api', apiRouter)

// Root fallback health route
app.get('/', (req, res) => {
  res.json({
    name: 'Railway Intelligence System API',
    version: '1.0.0',
    status: 'online',
    endpoints: '/api',
  })
})

// 404 & Centralized Error Handlers
app.use(notFound)
app.use(errorHandler)

export default app
