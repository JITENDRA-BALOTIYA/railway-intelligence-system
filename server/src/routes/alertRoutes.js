import { Router } from 'express'
import { alertController } from '../controllers/alertController.js'

const router = Router()

// GET /api/alerts
router.get('/', alertController.getAlerts)

export default router
