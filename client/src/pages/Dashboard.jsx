import { useState, useEffect } from 'react'
import { useTrain } from '../context/TrainContext.jsx'
import { analyticsService } from '../services/analyticsService.js'
import { StatsGrid } from '../components/dashboard/StatsGrid.jsx'
import { QuickActions } from '../components/dashboard/QuickActions.jsx'
import { LiveActivityFeed } from '../components/dashboard/LiveActivityFeed.jsx'
import { TrainTrackingCard } from '../components/tracking/TrainTrackingCard.jsx'
import { RouteTimeline } from '../components/tracking/RouteTimeline.jsx'
import { AlertList } from '../components/alerts/AlertList.jsx'
import { useNotificationContext } from '../context/NotificationContext.jsx'
import { Loader } from '../components/common/Loader.jsx'
import { Sparkles, TrainFront } from 'lucide-react'

const Dashboard = () => {
  const { trains, selectedTrain, loading: trainsLoading } = useTrain()
  const { alerts } = useNotificationContext()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await analyticsService.getOverview()
        setOverview(data)
      } catch (e) {
        console.error('Failed to load analytics overview:', e)
      } finally {
        setLoading(false)
      }
    }
    loadOverview()
  }, [])

  if (loading || trainsLoading) {
    return <Loader message="Initializing Railway Intelligence Operations..." />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Operations Command Center
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time network intelligence, AI predictions, and corridor performance analytics
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Indian Railways AI Grid Active</span>
        </div>
      </div>

      {/* KPI Stats */}
      <StatsGrid overview={overview} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Grid: Active Train + Timeline + Feed + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Train Tracking */}
          {selectedTrain && <TrainTrackingCard train={selectedTrain} />}

          {/* Route Timeline */}
          {selectedTrain?.timeline && (
            <RouteTimeline timeline={selectedTrain.timeline} />
          )}
        </div>

        <div className="space-y-6">
          {/* Live Activity Feed */}
          <LiveActivityFeed trains={trains} />

          {/* Active Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Active Network Advisories
            </h3>
            <AlertList alerts={alerts.slice(0, 3)} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
