import { Router } from 'express'
import { etaController } from '../controllers/etaController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { validateTrainNumber } from '../validators/trainValidator.js'

const router = Router()

// GET /api/eta/:trainNumber
router.get('/:trainNumber', validateRequest(validateTrainNumber), etaController.getETA)

// GET /api/eta/:trainNumber/history
router.get('/:trainNumber/history', validateRequest(validateTrainNumber), etaController.getETAHistory)

export default router
