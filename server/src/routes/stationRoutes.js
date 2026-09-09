import { Router } from 'express'
import { stationController } from '../controllers/stationController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { validateStationCode } from '../validators/trainValidator.js'
import { requireAuth, requireStationAccess } from '../middleware/authMiddleware.js'

const router = Router()

// Public station lookups
// GET /api/stations
router.get('/', stationController.getAllStations)

// GET /api/stations/:stationCode
router.get('/:stationCode', validateRequest(validateStationCode), stationController.getStationByCode)

// GET /api/stations/:stationCode/crowd
router.get('/:stationCode/crowd', validateRequest(validateStationCode), stationController.getStationCrowd)

// GET /api/stations/:stationCode/trains
router.get('/:stationCode/trains', validateRequest(validateStationCode), stationController.getStationTrains)

// Station Operations (require authentication and station access scoping)
// GET /api/stations/:stationCode/arrivals
router.get(
  '/:stationCode/arrivals',
  requireAuth,
  requireStationAccess,
  stationController.getStationArrivals,
)

// GET /api/stations/:stationCode/departures
router.get(
  '/:stationCode/departures',
  requireAuth,
  requireStationAccess,
  stationController.getStationDepartures,
)

// GET /api/stations/:stationCode/platforms
router.get(
  '/:stationCode/platforms',
  requireAuth,
  requireStationAccess,
  stationController.getStationPlatformStatus,
)

// GET /api/stations/:stationCode/alerts
router.get(
  '/:stationCode/alerts',
  requireAuth,
  requireStationAccess,
  stationController.getStationAlerts,
)

export default router
