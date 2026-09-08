import { Router } from 'express'
import { analyticsController } from '../controllers/analyticsController.js'

const router = Router()

// GET /api/analytics/overview
router.get('/overview', analyticsController.getOverview)

// GET /api/analytics/congestion
router.get('/congestion', analyticsController.getCongestion)

export default router
