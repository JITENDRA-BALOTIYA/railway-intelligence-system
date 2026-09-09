import { Router } from 'express'
import trainRoutes from './trainRoutes.js'
import etaRoutes from './etaRoutes.js'
import delayRoutes from './delayRoutes.js'
import stationRoutes from './stationRoutes.js'
import analyticsRoutes from './analyticsRoutes.js'
import alertRoutes from './alertRoutes.js'
import authRoutes from './authRoutes.js'
import cleaningRoutes from './cleaningRoutes.js'
import { analyticsService } from '../services/analyticsService.js'
import { trainService } from '../services/trainService.js'
import { alertController } from '../controllers/alertController.js'
import { dashboardController } from '../controllers/dashboardController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { ApiResponse } from '../utils/apiResponse.js'

const apiRouter = Router()

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  ApiResponse.success(res, {
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Railway Intelligence System API',
  }, 'Service healthy')
})

// Unified dashboard overview endpoint (for initial high-speed single hydration)
apiRouter.get('/dashboard', async (req, res, next) => {
  try {
    const [trains, overview, alerts] = await Promise.all([
      trainService.getAllTrains({ limit: 10 }),
      analyticsService.getOverview(),
      (await import('../models/Alert.js')).Alert ? import('../config/database.js').then(d => d.memoryStore.alerts) : [],
    ])

    const statCards = [
      {
        title: 'Tracked Trains',
        value: '7,612',
        subtitle: 'Live on Network',
        tone: 'green',
        spark: overview.sparklines?.activeTrains || [20, 24, 28, 35],
      },
      {
        title: 'On Time Trains',
        value: `${overview.onTimePercentage}%`,
        subtitle: 'On Time Rate',
        tone: 'green',
        spark: overview.sparklines?.onTime || [70, 72, 74, 75],
      },
      {
        title: 'Delayed Trains',
        value: `${overview.delayedTrains}`,
        subtitle: 'Running Late',
        tone: 'orange',
        spark: overview.sparklines?.delays || [22, 20, 18, 16],
      },
      {
        title: 'Average Delay',
        value: `${overview.averageDelayMinutes} min`,
        subtitle: 'Network Wide',
        tone: 'purple',
        spark: overview.sparklines?.avgDelay || [22, 20, 19, 18],
      },
    ]

    return res.json({
      success: true,
      data: {
        statCards,
        trains,
        overview,
        alerts,
      },
      // Keep top-level keys for backward-compatibility with earlier components
      statCards,
      trains,
      overview,
      alerts,
    })
  } catch (err) {
    next(err)
  }
})

// Mount domain routes
apiRouter.use('/auth', authRoutes)
apiRouter.use('/cleaning', cleaningRoutes)
apiRouter.use('/trains', trainRoutes)
apiRouter.use('/eta', etaRoutes)
apiRouter.use('/delays', delayRoutes)
apiRouter.use('/stations', stationRoutes)
apiRouter.use('/analytics', analyticsRoutes)
apiRouter.use('/alerts', alertRoutes)

// Role-tailored dashboard metrics
apiRouter.get('/dashboard/role', requireAuth, dashboardController.getRoleDashboard)

export { apiRouter }
export default apiRouter
