import { seedAnalytics } from '../data/seedData.js'
import { trainService } from './trainService.js'

export const analyticsService = {
  /**
   * Network-wide overview KPI analytics
   */
  async getOverview() {
    const trains = await trainService.getAllTrains()
    const total = trains.length || 1
    const delayed = trains.filter((t) => t.delay > 5).length
    const onTime = total - delayed
    const onTimePercentage = Math.round((onTime / total) * 100)
    const avgDelay = Math.round(trains.reduce((acc, t) => acc + (t.delay || 0), 0) / total)

    return {
      trackedTrains: total,
      onTimePercentage,
      delayedTrains: delayed,
      averageDelayMinutes: avgDelay,
      systemHealthScore: seedAnalytics.overview.systemHealthScore,
      networkThroughput: seedAnalytics.overview.networkThroughput,
      sparklines: seedAnalytics.overview.sparklines,
      delayReasonsAggregate: seedAnalytics.delayReasonsAggregate,
    }
  },

  /**
   * Corridor-level congestion and bottle-neck mapping
   */
  async getCongestionData() {
    return {
      corridors: seedAnalytics.corridorCongestion,
      highRiskSections: [
        { section: 'Delhi - Ghaziabad - Kanpur', risk: 'Extreme Fog & Saturation', action: 'Speed Capped at 75 km/h' },
        { section: 'Amritsar - Ludhiana - Ambala', risk: 'Dense Smog', action: 'Headway Spacing Extended' },
        { section: 'Durgapur - Barddhaman', risk: 'Interlocking Work', action: 'Single Line Reversible Operation' },
      ],
      timestamp: new Date().toISOString(),
    }
  },
}
