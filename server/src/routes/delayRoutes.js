import { Router } from 'express'
import { delayController } from '../controllers/delayController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { validateTrainNumber } from '../validators/trainValidator.js'

const router = Router()

// GET /api/delays/:trainNumber
router.get('/:trainNumber', validateRequest(validateTrainNumber), delayController.getDelay)

// GET /api/delays/:trainNumber/reasons
router.get('/:trainNumber/reasons', validateRequest(validateTrainNumber), delayController.getDelayReasons)

export default router
