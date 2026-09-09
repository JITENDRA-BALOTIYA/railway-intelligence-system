import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/login', authController.login)
router.post('/register', authController.register)
router.get('/me', requireAuth, authController.getCurrentUser)

export default router
