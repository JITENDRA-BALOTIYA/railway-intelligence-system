export const dashboardController = {
  getDashboard: async (req, res) => {
    try {
      const { railwayService } = await import('../services/railwayService.js')
      res.json(railwayService.getDashboard())
    } catch (error) {
      res.status(500).json({ message: 'Unable to fetch dashboard data', error: error.message })
    }
  },
}

export const trainsController = {
  getTrains: async (req, res) => {
    try {
      const { railwayService } = await import('../services/railwayService.js')
      res.json(railwayService.getTrains())
    } catch (error) {
      res.status(500).json({ message: 'Unable to fetch train data', error: error.message })
    }
  },

  getTrainById: async (req, res) => {
    try {
      const { railwayService } = await import('../services/railwayService.js')
      const train = railwayService.getTrainById(req.params.id)

      if (!train) {
        return res.status(404).json({ message: 'Train not found' })
      }

      res.json(train)
    } catch (error) {
      res.status(500).json({ message: 'Unable to fetch train by id', error: error.message })
    }
  },
}
