import app from './app.js'
import { config } from './config/env.js'
import { connectDatabase } from './config/database.js'
import { logger } from './utils/logger.js'

const startServer = async () => {
  try {
    // Initialize database connection & seed checks
    await connectDatabase()

    const server = app.listen(config.port, () => {
      logger.info(`=======================================================`)
      logger.info(` Railway Intelligence System API is live on port ${config.port}`)
      logger.info(` Health check: http://localhost:${config.port}/api/health`)
      logger.info(` Environment: ${config.nodeEnv}`)
      logger.info(`=======================================================`)
    })

    // Graceful shutdown handling
    const shutdown = () => {
      logger.info('Received shutdown signal. Gracefully closing server...')
      server.close(() => {
        logger.info('HTTP server closed.')
        process.exit(0)
      })
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
