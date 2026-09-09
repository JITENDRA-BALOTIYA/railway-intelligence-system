import { Router } from 'express'
import { cleaningController } from '../controllers/cleaningController.js'
import { requireAuth, requireRole, requireStationAccess } from '../middleware/authMiddleware.js'

const router = Router()

// All cleaning routes require authentication, role check, and station access check
router.use(requireAuth)
router.use(requireRole('cleaning_staff', 'station_master', 'super_admin'))
router.use(requireStationAccess)

router.get('/tasks', cleaningController.getTasks)
router.get('/upcoming', cleaningController.getUpcoming)
router.get('/stats', cleaningController.getStats)
router.post('/tasks/:taskId/start', cleaningController.startTask)
router.post('/tasks/:taskId/complete', cleaningController.completeTask)

export default router
