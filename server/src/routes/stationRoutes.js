import { Router } from 'express'
import { stationController } from '../controllers/stationController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { validateStationCode } from '../validators/trainValidator.js'
import { requireAuth, requireRole, requireStationAccess } from '../middleware/authMiddleware.js'

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

// Station Operations (require authentication, role check, and station access scoping)
// GET /api/stations/:stationCode/schedule
router.get(
  '/:stationCode/schedule',
  requireAuth,
  requireRole('station_master', 'super_admin'),
  requireStationAccess,
  stationController.getStationSchedule,
)

// GET /api/stations/:stationCode/arrivals
router.get(
  '/:stationCode/arrivals',
  requireAuth,
  requireRole('station_master', 'super_admin'),
  requireStationAccess,
  stationController.getStationArrivals,
)

// GET /api/stations/:stationCode/departures
router.get(
  '/:stationCode/departures',
  requireAuth,
  requireRole('station_master', 'super_admin'),
  requireStationAccess,
  stationController.getStationDepartures,
)

// GET /api/stations/:stationCode/platforms
router.get(
  '/:stationCode/platforms',
  requireAuth,
  requireRole('station_master', 'super_admin'),
  requireStationAccess,
  stationController.getStationPlatformStatus,
)

// GET /api/stations/:stationCode/platforms/:platformNumber
router.get(
  '/:stationCode/platforms/:platformNumber',
  requireAuth,
  requireRole('station_master', 'super_admin'),
  requireStationAccess,
  stationController.getPlatformDetail,
)

// GET /api/stations/:stationCode/alerts
router.get(
  '/:stationCode/alerts',
  requireAuth,
  requireRole('station_master', 'super_admin'),
  requireStationAccess,
  stationController.getStationAlerts,
)

// GET /api/stations/:stationCode/alerts/:alertId
router.get(
  '/:stationCode/alerts/:alertId',
  requireAuth,
  requireRole('station_master', 'super_admin'),
  requireStationAccess,
  stationController.getStationAlertDetail,
)

// POST /api/stations/:stationCode/alerts/:alertId/acknowledge
router.post(
  '/:stationCode/alerts/:alertId/acknowledge',
  requireAuth,
  requireRole('station_master', 'super_admin'),
  requireStationAccess,
  stationController.acknowledgeAlert,
)

export default router
