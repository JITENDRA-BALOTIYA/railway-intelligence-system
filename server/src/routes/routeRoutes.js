import { Router } from 'express'
import { routeController } from '../controllers/routeController.js'

const router = Router()

// GET /api/routes?from=NDLS&to=CNB
router.get('/', routeController.getRoute)

// GET /api/routes/live?from=NDLS&to=CNB
router.get('/live', routeController.getLiveRoute)

// GET /api/routes/stations
router.get('/stations', routeController.getStationList)

export default router
