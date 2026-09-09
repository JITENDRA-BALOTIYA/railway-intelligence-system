import { useState, useEffect } from 'react'
import { analyticsService } from '../services/analyticsService.js'
import { RoutePerformanceChart } from '../components/analytics/RoutePerformanceChart.jsx'
import { DelayReasonDistribution } from '../components/analytics/DelayReasonDistribution.jsx'
import { Card } from '../components/common/Card.jsx'
import { Loader } from '../components/common/Loader.jsx'

const RouteAnalytics = () => {
  const [data, setData] = useState(null)
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [congestion, ov] = await Promise.all([
          analyticsService.getCongestion(),
          analyticsService.getOverview(),
        ])
        setData(congestion)
        setOverview(ov)
      } catch (e) {
        console.error('Failed to load analytics:', e)
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  if (loading) return <Loader message="Computing route analytics..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Route Analytics & Performance</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Network-wide performance, corridor saturation indices, and delay distribution
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Punctuality Rate</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">{overview?.onTimePercentage}%</div>
        </Card>
        <Card>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Avg Network Delay</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 font-mono">{overview?.averageDelayMinutes} min</div>
        </Card>
        <Card>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">System Health</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-1 font-mono">{overview?.systemHealthScore}%</div>
        </Card>
        <Card>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Throughput</div>
          <div className="text-base font-bold text-slate-900 mt-1">{overview?.networkThroughput}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoutePerformanceChart corridors={data?.corridors || []} />
        <DelayReasonDistribution reasons={overview?.delayReasonsAggregate || []} />
      </div>
    </div>
  )
}

export default RouteAnalytics
