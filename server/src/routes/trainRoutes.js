import { Router } from 'express'
import { trainController } from '../controllers/trainController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { validateTrainNumber } from '../validators/trainValidator.js'

const router = Router()

// GET /api/trains
router.get('/', trainController.getTrains)

// GET /api/trains/:trainNumber
router.get('/:trainNumber', validateRequest(validateTrainNumber), trainController.getTrainByNumber)

// GET /api/trains/:trainNumber/live
router.get('/:trainNumber/live', validateRequest(validateTrainNumber), trainController.getLiveTracking)

export default router
