import { cleaningService } from '../services/cleaningService.js'
import { ApiResponse } from '../utils/apiResponse.js'

export const cleaningController = {
  /**
   * Get cleaning tasks for station
   */
  async getTasks(req, res, next) {
    try {
      const stationId = req.query.stationId || req.user.stationId || 'NDLS'
      const status = req.query.status || null
      const tasks = await cleaningService.getTasksForStation(stationId, status)
      return ApiResponse.success(res, tasks, 'Cleaning tasks retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  /**
   * Get approaching upcoming trains for cleaning prep
   */
  async getUpcoming(req, res, next) {
    try {
      const stationId = req.query.stationId || req.user.stationId || 'NDLS'
      const upcoming = await cleaningService.getUpcomingApproaching(stationId)
      return ApiResponse.success(res, upcoming, 'Upcoming trains for cleaning prep')
    } catch (err) {
      next(err)
    }
  },

  /**
   * Get cleaning performance statistics
   */
  async getStats(req, res, next) {
    try {
      const stationId = req.query.stationId || req.user.stationId || 'NDLS'
      const stats = await cleaningService.getCleaningStats(stationId)
      return ApiResponse.success(res, stats, 'Cleaning performance metrics')
    } catch (err) {
      next(err)
    }
  },

  /**
   * Start cleaning a task
   */
  async startTask(req, res, next) {
    try {
      const { taskId } = req.params
      const task = await cleaningService.getTaskById(taskId)
      if (!task) {
        return ApiResponse.error(res, 'Cleaning task not found', 404)
      }

      // Enforce station scoping: non-super_admin users can only act on their assigned station
      if (req.user?.role !== 'super_admin' && req.user?.stationId) {
        const userStn = String(req.user.stationId).trim().toUpperCase()
        const taskStn = String(task.stationId || '').trim().toUpperCase()
        if (taskStn && taskStn !== userStn) {
          return ApiResponse.error(
            res,
            `Access denied. You are only authorized for station ${userStn}, not ${taskStn}.`,
            403,
          )
        }
      }

      const updated = await cleaningService.startCleaningTask(
        taskId,
        req.user?.userId || 'staff_01',
        req.user?.name || 'Sanitation Staff',
      )

      if (!updated) {
        return ApiResponse.error(res, 'Cleaning task not found', 404)
      }

      return ApiResponse.success(res, updated, 'Cleaning task started')
    } catch (err) {
      next(err)
    }
  },

  /**
   * Complete cleaning a task
   */
  async completeTask(req, res, next) {
    try {
      const { taskId } = req.params
      const { notes } = req.body

      const task = await cleaningService.getTaskById(taskId)
      if (!task) {
        return ApiResponse.error(res, 'Cleaning task not found', 404)
      }

      // Enforce station scoping: non-super_admin users can only act on their assigned station
      if (req.user?.role !== 'super_admin' && req.user?.stationId) {
        const userStn = String(req.user.stationId).trim().toUpperCase()
        const taskStn = String(task.stationId || '').trim().toUpperCase()
        if (taskStn && taskStn !== userStn) {
          return ApiResponse.error(
            res,
            `Access denied. You are only authorized for station ${userStn}, not ${taskStn}.`,
            403,
          )
        }
      }

      const updated = await cleaningService.completeCleaningTask(taskId, req.user?.userId, notes)

      if (!updated) {
        return ApiResponse.error(res, 'Cleaning task not found', 404)
      }

      return ApiResponse.success(res, updated, 'Cleaning task completed')
    } catch (err) {
      next(err)
    }
  },
}
