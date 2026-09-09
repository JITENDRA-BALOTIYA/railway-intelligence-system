import { useState, useEffect } from 'react'
import {
  Search,
  TrainFront,
  Clock,
  Radio,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Bookmark,
  Share2,
  Calendar,
  Navigation,
} from 'lucide-react'
import { useTrain } from '../context/TrainContext.jsx'
import { trainService } from '../services/trainService.js'
import { delayService } from '../services/delayService.js'

export default function PublicUserDashboard() {
  const { searchTrain, addRecentSearch } = useTrain()
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [trainData, setTrainData] = useState(null)
  const [delayInfo, setDelayInfo] = useState(null)
  const [activeTab, setActiveTab] = useState('route') // 'route' | 'delay'

  const handleSearch = async (trainNum) => {
    const cleanNum = String(trainNum || searchInput).trim()
    if (!cleanNum) return

    setLoading(true)
    setErrorMsg(null)
    setTrainData(null)
    setDelayInfo(null)

    try {
      const data = await trainService.getLiveTracking(cleanNum)
      if (data && data.trainNumber) {
        setTrainData(data)
        addRecentSearch(data.trainNumber)

        // Fetch delay breakdown
        try {
          const delays = await delayService.getDelayBreakdown(data.trainNumber)
          setDelayInfo(delays)
        } catch {
          // optional delay detail
        }
      } else {
        setErrorMsg(`Train ${cleanNum} not found. Please verify the train number.`)
      }
    } catch (err) {
      if (err.statusCode === 404) {
        setErrorMsg(`Train ${cleanNum} not found. Please check the train number and try again.`)
      } else {
        setErrorMsg('Live railway data is temporarily unavailable. Please try again in a few moments.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLookup = (num) => {
    setSearchInput(num)
    handleSearch(num)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-8 text-white shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/60 border border-emerald-400/40 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>Official RailRadar Live Tracking Feed</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Track Your Train in Real-Time
          </h1>
          <p className="text-sm text-emerald-100/90 font-medium">
            Live GPS coordinates, halt arrival times, platform numbers, and delay updates
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch()
            }}
            className="flex flex-col sm:flex-row gap-2 pt-2"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter 5-digit Train Number (e.g., 12301, 12951)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-400/30 shadow-md font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Track Train</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-emerald-200 pt-1">
            <span className="font-semibold text-emerald-300">Popular Express Trains:</span>
            {[
              { num: '12301', name: 'Howrah Rajdhani' },
              { num: '12951', name: 'Mumbai Rajdhani' },
              { num: '22436', name: 'Vande Bharat' },
              { num: '12002', name: 'Bhopal Shatabdi' },
            ].map((t) => (
              <button
                key={t.num}
                type="button"
                onClick={() => handleQuickLookup(t.num)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-bold transition-colors cursor-pointer"
              >
                {t.num} ({t.name})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm font-semibold">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <div className="font-bold">Lookup Unsuccessful</div>
            <p className="text-xs text-rose-600 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Train Details Card */}
      {trainData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200">
                    {trainData.trainNumber}
                  </span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    {trainData.type}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {trainData.trainName}
                </h2>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {trainData.source} → {trainData.destination}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    trainData.status === 'Delayed'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {trainData.status} ({trainData.delay > 0 ? `+${trainData.delay} min` : 'On Time'})
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                  {trainData.platform || 'Platform N/A'}
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Location</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">
                  {trainData.currentStation || 'En Route'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Next Halt Station</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">
                  {trainData.nextStation || 'Destination'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Speed</span>
                <span className="font-bold font-mono text-emerald-700 text-sm mt-0.5 block">
                  {trainData.speed} km/h
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Distance Remaining</span>
                <span className="font-bold font-mono text-slate-900 text-sm mt-0.5 block">
                  {trainData.distanceRemainingKm != null ? `${trainData.distanceRemainingKm} km` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Delay & Plain Language Explanation */}
            {delayInfo && trainData.delay > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Operational Delay Analysis</span>
                </div>
                <p className="text-amber-800">
                  Train running <span className="font-bold font-mono">+{trainData.delay} minutes</span> behind schedule.
                  Primary contributing factor:{' '}
                  <span className="font-bold">
                    {delayInfo.reasons?.[0]?.factor || 'Signal Precedence & Line Clearance'}
                  </span>
                  . Expected recovery estimated in downstream section.
                </p>
              </div>
            )}
          </div>

          {/* Route Station Stops Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>Station Route & Scheduled Arrival Halts</span>
            </h3>

            {trainData.timeline && trainData.timeline.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {trainData.timeline.map((stop, idx) => {
                  const isCurrent = stop.status === 'Current'
                  const isDeparted = stop.complete || stop.status === 'Departed'

                  return (
                    <div key={`${stop.stationCode}-${idx}`} className="relative flex items-start justify-between gap-4">
                      {/* Timeline dot */}
                      <span
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold ${
                          isCurrent
                            ? 'bg-emerald-600 border-emerald-300 text-white ring-4 ring-emerald-500/20'
                            : isDeparted
                            ? 'bg-slate-300 border-slate-200 text-slate-600'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCurrent ? '•' : isDeparted ? '✓' : ''}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isCurrent ? 'text-emerald-700' : 'text-slate-900'}`}>
                            {stop.station}
                          </span>
                          <span className="font-mono text-xs text-slate-400 font-semibold">
                            ({stop.stationCode})
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                              Current Location
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {stop.platform || 'Platform N/A'} • {stop.distance || '—'}
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <div className="font-mono font-bold text-slate-900">
                          {stop.expectedTime || stop.time || '—'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 line-through">
                          Sched: {stop.scheduledTime || '—'}
                        </div>
                        <div className={`text-[10px] font-mono font-bold ${stop.delayMinutes > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {stop.delay}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Detailed station timeline unavailable for this train.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
