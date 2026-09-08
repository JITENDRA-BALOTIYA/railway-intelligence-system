import { Router } from 'express'
import { stationController } from '../controllers/stationController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { validateStationCode } from '../validators/trainValidator.js'

const router = Router()

// GET /api/stations
router.get('/', stationController.getAllStations)

// GET /api/stations/:stationCode
router.get('/:stationCode', validateRequest(validateStationCode), stationController.getStationByCode)

// GET /api/stations/:stationCode/crowd
router.get('/:stationCode/crowd', validateRequest(validateStationCode), stationController.getStationCrowd)

export default router
