import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Sparkles, TrainFront, Search, ArrowRight, Navigation } from 'lucide-react'

const Dashboard = () => {
  const { selectedTrain, recentSearches, searchTrain, loading: trainLoading } = useTrain()
  const { alerts } = useNotificationContext()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dashboardSearchInput, setDashboardSearchInput] = useState('')
  const navigate = useNavigate()

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

  const handleDashboardSearch = (e) => {
    e.preventDefault()
    if (dashboardSearchInput.trim()) {
      navigate(`/search?train=${encodeURIComponent(dashboardSearchInput.trim())}`)
    }
  }

  if (loading) {
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

      {/* Main Grid: Active Train or Search Prompt + Activity Feed + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {selectedTrain ? (
            <>
              {/* Active Train Tracking Card */}
              <TrainTrackingCard train={selectedTrain} />

              {/* Route Timeline */}
              {selectedTrain.timeline && selectedTrain.timeline.length > 0 && (
                <RouteTimeline timeline={selectedTrain.timeline} />
              )}
            </>
          ) : (
            /* Prompt when no train is currently searched */
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-xs">
                <Navigation className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Search for a train to begin live tracking
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 max-w-md mx-auto leading-relaxed">
                Enter any Indian Railways train number to view live GPS position, delay analytics, platform details, and route progress.
              </p>

              {/* Search input inside prompt */}
              <form onSubmit={handleDashboardSearch} className="max-w-md mx-auto mt-5 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={dashboardSearchInput}
                    onChange={(e) => setDashboardSearchInput(e.target.value)}
                    placeholder="Enter train number (e.g. 12301)..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  Track Train
                </button>
              </form>

              {/* Quick sample trains */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Popular:</span>
                {['12301', '12951', '12002', '22221'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => navigate(`/search?train=${num}`)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono transition-colors cursor-pointer"
                  >
                    #{num}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Live Activity Feed */}
          <LiveActivityFeed />

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
