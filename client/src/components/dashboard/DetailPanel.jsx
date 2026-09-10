import { useState, useEffect, useCallback, useRef } from 'react'
import {
  X,
  TrainFront,
  Building2,
  ShieldAlert,
  Clock,
  MapPin,
  Gauge,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Share2,
  ChevronRight,
  Sparkles,
  Info,
  Radio,
  Check,
  Circle,
} from 'lucide-react'
import { stationOpsService } from '../../services/api.js'
import { trainService } from '../../services/trainService.js'

// In-memory response cache with 25s TTL to avoid duplicate fetches
const panelCache = new Map()
const CACHE_TTL_MS = 25 * 1000

export const DetailPanel = ({
  isOpen,
  onClose,
  type: initialType,
  id: initialId,
  stationCode = 'NDLS',
  initialData = null,
  onAlertAcknowledged,
}) => {
  const [currentType, setCurrentType] = useState(initialType)
  const [currentId, setCurrentId] = useState(initialId)
  const [history, setHistory] = useState([]) // For back navigation between related items

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  // Alert acknowledgment state
  const [acknowledging, setAcknowledging] = useState(false)
  const [ackSuccess, setAckSuccess] = useState(false)

  // Sync state when props change
  useEffect(() => {
    if (isOpen) {
      setCurrentType(initialType)
      setCurrentId(initialId)
      setHistory([])
      setError(null)
      setAckSuccess(false)
    }
  }, [isOpen, initialType, initialId])

  // Handle ESC key press & body scroll locking
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Fetch item details based on type & ID
  const fetchDetails = useCallback(
    async (bypassCache = false) => {
      if (!isOpen || !currentType || !currentId) return

      const cacheKey = `${currentType}_${currentId}_${stationCode}`

      if (!bypassCache) {
        const cached = panelCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
          setData(cached.data)
          setLoading(false)
          return
        }
      }

      if (bypassCache) setRefreshing(true)
      else setLoading(true)
      setError(null)

      try {
        let result = null

        if (currentType === 'train') {
          // Fetch live telemetry + train route simultaneously
          const [liveRes, routeRes] = await Promise.all([
            trainService.getLiveTracking(currentId).catch(() => null),
            trainService.getTrainRoute(currentId).catch(() => null),
          ])

          if (!liveRes && !routeRes) {
            // Try fetching basic train details
            const trainBasic = await trainService.getTrainByNumber(currentId).catch(() => null)
            if (trainBasic) {
              result = {
                ...trainBasic,
                timeline: trainBasic.timeline || [],
                route: trainBasic.route || [],
                isLive: false,
              }
            } else {
              throw new Error(`Train #${currentId} details currently unavailable from network`)
            }
          } else {
            result = {
              ...(liveRes || routeRes),
              routeData: routeRes || null,
              timeline: liveRes?.timeline || routeRes?.timeline || [],
            }
          }
        } else if (currentType === 'platform') {
          result = await stationOpsService.getPlatformDetail(stationCode, currentId)
        } else if (currentType === 'alert') {
          result = await stationOpsService.getAlertDetail(stationCode, currentId)
        }

        if (!result) {
          throw new Error(`Unable to load ${currentType} details`)
        }

        // Cache result
        panelCache.set(cacheKey, { data: result, timestamp: Date.now() })
        setData(result)
      } catch (err) {
        console.error(`DetailPanel fetch error (${currentType}/${currentId}):`, err)
        setError(err.message || 'Failed to load details. Please try again.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [isOpen, currentType, currentId, stationCode],
  )

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  // Navigation handlers for cross-linking
  const navigateTo = (newType, newId) => {
    setHistory((prev) => [...prev, { type: currentType, id: currentId }])
    setCurrentType(newType)
    setCurrentId(newId)
    setData(null)
    setAckSuccess(false)
  }

  const navigateBack = () => {
    if (history.length === 0) return
    const prevItem = history[history.length - 1]
    setHistory((prev) => prev.slice(0, -1))
    setCurrentType(prevItem.type)
    setCurrentId(prevItem.id)
    setData(null)
    setAckSuccess(false)
  }

  // Handle in-place alert acknowledgment
  const handleAcknowledge = async () => {
    if (!currentId || acknowledging) return
    setAcknowledging(true)

    try {
      const updated = await stationOpsService.acknowledgeAlert(stationCode, currentId)
      setAckSuccess(true)
      setData((prev) => ({
        ...prev,
        status: 'acknowledged',
        acknowledgedBy: updated?.acknowledgedBy || 'Station Master',
        acknowledgedAt: updated?.acknowledgedAt || new Date().toISOString(),
      }))

      // Update cache
      const cacheKey = `${currentType}_${currentId}_${stationCode}`
      panelCache.set(cacheKey, {
        data: {
          ...data,
          status: 'acknowledged',
          acknowledgedBy: updated?.acknowledgedBy || 'Station Master',
          acknowledgedAt: updated?.acknowledgedAt || new Date().toISOString(),
        },
        timestamp: Date.now(),
      })

      if (onAlertAcknowledged) {
        onAlertAcknowledged(currentId, updated)
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err)
      setError('Could not acknowledge alert. Please try again.')
    } finally {
      setAcknowledging(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-16">
        <div className="w-screen max-w-xl md:max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200/90 transform transition-transform duration-300 ease-in-out">
          {/* Top Sticky Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3 min-w-0">
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={navigateBack}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                  title="Go back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      currentType === 'train'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentType === 'platform'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {currentType === 'train'
                      ? 'Train Telemetry'
                      : currentType === 'platform'
                      ? 'Platform Berth'
                      : 'Operational Alert'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">#{currentId}</span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 truncate mt-0.5">
                  {currentType === 'train'
                    ? data?.trainName || `Train #${currentId}`
                    : currentType === 'platform'
                    ? `Platform ${currentId} • ${stationCode}`
                    : data?.title || `Alert #${currentId}`}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fetchDetails(true)}
                disabled={refreshing || loading}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border border-slate-200 transition-colors cursor-pointer"
                title="Refresh live details"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title="Close panel (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <PanelSkeleton type={currentType} />
            ) : error ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-200">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Unable to load details</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchDetails(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Retry Connection
                </button>
              </div>
            ) : data ? (
              <>
                {currentType === 'train' && (
                  <TrainDetailContent train={data} stationCode={stationCode} />
                )}
                {currentType === 'platform' && (
                  <PlatformDetailContent
                    platform={data}
                    stationCode={stationCode}
                    onSelectTrain={(trainNum) => navigateTo('train', trainNum)}
                  />
                )}
                {currentType === 'alert' && (
                  <AlertDetailContent
                    alert={data}
                    stationCode={stationCode}
                    onSelectTrain={(trainNum) => navigateTo('train', trainNum)}
                    onSelectPlatform={(pfNum) => navigateTo('platform', pfNum)}
                    onAcknowledge={handleAcknowledge}
                    acknowledging={acknowledging}
                    ackSuccess={ackSuccess}
                  />
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Loading Skeleton tailored to each view type
 */
const PanelSkeleton = ({ type }) => (
  <div className="space-y-4 animate-pulse">
    <div className="h-20 bg-slate-100 rounded-2xl" />
    <div className="grid grid-cols-2 gap-3">
      <div className="h-16 bg-slate-100 rounded-xl" />
      <div className="h-16 bg-slate-100 rounded-xl" />
    </div>
    <div className="h-32 bg-slate-100 rounded-2xl" />
    <div className="space-y-2">
      <div className="h-8 bg-slate-100 rounded-lg w-1/3" />
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
    </div>
  </div>
)

/**
 * Train Detail View Content
 */
const TrainDetailContent = ({ train, stationCode }) => {
  const isDelayed = (train.delay || 0) > 0
  const totalDist = train.totalDistanceKm || 0
  const progressPct = train.progress || 0

  // Locate halt at this specific station
  const stationHalt = train.timeline?.find(
    (h) => h.stationCode?.toUpperCase() === stationCode?.toUpperCase() || h.station?.includes(stationCode),
  )

  const schedArr = stationHalt?.scheduledTime || train.scheduledArrival || 'N/A'
  const expArr = stationHalt?.expectedTime || stationHalt?.time || train.expectedArrival || schedArr
  const platform = stationHalt?.platform || train.platform || 'Platform: —'

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner Status */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <TrainFront className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">{train.trainName}</div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium mt-0.5">
              <span className="font-mono text-emerald-700 font-bold">#{train.trainNumber}</span>
              <span>•</span>
              <span>{train.type || 'Express'}</span>
            </div>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            train.status === 'At Platform'
              ? 'bg-purple-100 text-purple-800'
              : train.status === 'Delayed'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {train.status}
        </span>
      </div>

      {/* Station Master Focus Card: Schedule & Dwell at THIS Station */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Berth Schedule at {stationCode}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md bg-white border border-emerald-300 font-mono font-bold text-xs text-emerald-800 shadow-xs">
            {platform}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
            <div className="text-[10px] text-slate-500 font-medium">Scheduled Time</div>
            <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">{schedArr}</div>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
            <div className="text-[10px] text-slate-500 font-medium">Expected Time (Live)</div>
            <div className="text-sm font-mono font-bold text-emerald-800 mt-0.5">{expArr}</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs font-medium">
          <span className="text-slate-600">Current Delay Variance:</span>
          <span className={`font-mono font-bold ${isDelayed ? 'text-rose-600' : 'text-emerald-700'}`}>
            {isDelayed ? `+${train.delay} min delay` : 'On Schedule'}
          </span>
        </div>
      </div>

      {/* Journey Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] font-bold uppercase text-slate-400">Current Speed</div>
          <div className="text-sm font-black font-mono text-slate-900 mt-0.5">
            {train.speed != null ? `${train.speed} km/h` : 'N/A'}
          </div>
          <div className="text-[9px] text-slate-400">Max: {train.maxSpeed || 130} km/h</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] font-bold uppercase text-slate-400">Current Location</div>
          <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
            {train.currentStationName || train.currentStation || 'En Route'}
          </div>
          <div className="text-[9px] text-emerald-600 font-medium">Active Block</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] font-bold uppercase text-slate-400">Next Halt</div>
          <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
            {train.nextStation || 'N/A'}
          </div>
          <div className="text-[9px] text-slate-400">Upcoming signal</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Distance</div>
          <div className="text-sm font-black font-mono text-slate-900 mt-0.5">
            {totalDist > 0 ? `${totalDist} km` : 'N/A'}
          </div>
          <div className="text-[9px] text-slate-400">{train.duration || 'Express'}</div>
        </div>
      </div>

      {/* Journey Progress */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
          <span>Route Progress</span>
          <span className="font-mono text-emerald-700">{progressPct}%</span>
        </div>
        <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate">{train.source || 'Origin'}</span>
          <span className="truncate">{train.destination || 'Destination'}</span>
        </div>
      </div>

      {/* Full Route Vertical Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span>Full Route Timeline ({train.timeline?.length || 0} Halts)</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">
            Updated {new Date(train.lastUpdated || Date.now()).toLocaleTimeString()}
          </span>
        </div>

        {train.timeline && train.timeline.length > 0 ? (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {train.timeline.map((stop, idx) => {
              const isStationCurrent =
                stop.status === 'Current' ||
                stop.stationCode?.toUpperCase() === train.currentStationCode?.toUpperCase()
              const isThisStation =
                stop.stationCode?.toUpperCase() === stationCode?.toUpperCase()

              return (
                <div key={idx} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 transition-all ${
                      isStationCurrent
                        ? 'bg-emerald-600 border-emerald-200 ring-4 ring-emerald-100 animate-pulse'
                        : stop.complete
                        ? 'bg-emerald-500 border-white'
                        : 'bg-white border-slate-300'
                    }`}
                  />

                  {/* Stop Card */}
                  <div
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      isThisStation
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30'
                        : isStationCurrent
                        ? 'bg-slate-50 border-emerald-200'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-slate-900 truncate">
                          {stop.station}
                        </span>
                        {stop.stationCode && (
                          <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.2 rounded bg-slate-100">
                            {stop.stationCode}
                          </span>
                        )}
                        {isThisStation && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-wider">
                            This Station
                          </span>
                        )}
                        {isStationCurrent && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase">
                            Live Train Location
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold shrink-0 ${
                          stop.delayMinutes > 0 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {stop.delay || 'On Time'}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="font-mono">
                          Sched: <strong className="text-slate-700">{stop.scheduledTime || stop.time}</strong>
                        </span>
                        {stop.expectedTime && stop.expectedTime !== stop.scheduledTime && (
                          <span className="font-mono text-emerald-800 font-semibold">
                            Exp: {stop.expectedTime}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-slate-600 font-medium">
                        {stop.platform || 'Platform: —'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
            No route halt details returned for this train.
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Platform Detail View Content
 */
const PlatformDetailContent = ({ platform, stationCode, onSelectTrain }) => {
  const isOccupied = platform.isOccupied

  return (
    <div className="space-y-6 text-slate-800">
      {/* Platform Status Card */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isOccupied
            ? 'bg-amber-50/50 border-amber-200'
            : 'bg-emerald-50/50 border-emerald-200'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-base shadow-xs ${
                isOccupied ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {platform.platformNumber}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {platform.platformLabel} Berth Status
              </h3>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {platform.trackClearance}
              </div>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isOccupied ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {platform.occupancyStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60 text-xs">
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Occupancy Window</div>
            <div className="font-bold text-slate-900 mt-0.5">{platform.occupancyWindow}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Clearance Estimate</div>
            <div className="font-bold text-slate-900 mt-0.5">
              {platform.estimatedClearanceTime || 'Immediate'}
            </div>
          </div>
        </div>
      </div>

      {/* Currently Occupying Train Card */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Currently Occupying Rake
        </h4>

        {platform.currentTrain ? (
          <div
            onClick={() => onSelectTrain(platform.currentTrain.trainNumber)}
            className="p-4 rounded-2xl bg-white border border-amber-300 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    #{platform.currentTrain.trainNumber}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    • {platform.currentTrain.type || 'Express'}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-slate-900 mt-1.5 group-hover:text-amber-800 transition-colors">
                  {platform.currentTrain.trainName}
                </h5>
                <div className="text-xs text-slate-500 mt-0.5">
                  {platform.currentTrain.source} → {platform.currentTrain.destination}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {platform.currentTrain.status || 'At Platform'}
                </span>
                <div className="text-xs font-bold text-rose-600 font-mono mt-1">
                  {platform.currentTrain.delayText}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400">Exp Departure:</span>{' '}
                <strong className="font-mono text-slate-900">
                  {platform.currentTrain.expectedDeparture || 'N/A'}
                </strong>
              </div>
              <div className="text-right text-emerald-700 font-semibold flex items-center justify-end gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>View Full Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="text-xs font-bold text-slate-800">
              No train currently at this platform
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Berth is clear and ready for incoming section signals or passenger rake placement.
            </p>
          </div>
        )}
      </div>

      {/* Next 2-3 Scheduled Trains */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Scheduled Inbound & Outbound Queue ({platform.nextTrains?.length || 0})
        </h4>

        {platform.nextTrains && platform.nextTrains.length > 0 ? (
          <div className="space-y-2.5">
            {platform.nextTrains.map((next, idx) => (
              <div
                key={`${next.trainNumber}-${idx}`}
                onClick={() => onSelectTrain(next.trainNumber)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer group flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-emerald-700">
                      #{next.trainNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-800">
                      {next.trainName}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {next.source} → {next.destination}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold font-mono text-slate-900">
                    {next.expectedArrival || next.expectedDeparture || next.scheduledArrival}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    {next.delayText || 'On Time'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
            No further scheduled movements queued for this platform today.
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Alert Detail View Content with Working In-Place Acknowledgment
 */
const AlertDetailContent = ({
  alert,
  stationCode,
  onSelectTrain,
  onSelectPlatform,
  onAcknowledge,
  acknowledging,
  ackSuccess,
}) => {
  const isAck = alert.status === 'acknowledged' || ackSuccess
  const severity = alert.severity || 'info'

  return (
    <div className="space-y-6 text-slate-800">
      {/* Alert Header Card */}
      <div
        className={`p-5 rounded-2xl border ${
          severity === 'critical'
            ? 'bg-rose-50/80 border-rose-200'
            : severity === 'warning'
            ? 'bg-amber-50/80 border-amber-200'
            : 'bg-blue-50/80 border-blue-200'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert
              className={`w-6 h-6 shrink-0 mt-0.5 ${
                severity === 'critical'
                  ? 'text-rose-600'
                  : severity === 'warning'
                  ? 'text-amber-600'
                  : 'text-blue-600'
              }`}
            />
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-700">
                {severity} Severity
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-2">{alert.title}</h3>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
              isAck ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {isAck ? 'Acknowledged' : 'Active Alert'}
          </span>
        </div>

        {/* Message */}
        <p className="text-xs text-slate-700 leading-relaxed mt-4 bg-white/70 p-3.5 rounded-xl border border-slate-200/60">
          {alert.description || alert.message}
        </p>

        {/* Metadata Footer */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/60 text-xs">
          <div>
            <span className="text-slate-400">Target Section:</span>{' '}
            <strong className="text-slate-800">{alert.section || `${stationCode} Sector`}</strong>
          </div>
          <div className="text-right">
            <span className="text-slate-400">Raised:</span>{' '}
            <strong className="font-mono text-slate-800">
              {new Date(alert.raisedTime || alert.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </strong>
          </div>
        </div>
      </div>

      {/* Acknowledgment Action Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-slate-900">Operational Acknowledgment</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {isAck
              ? `Acknowledged by ${alert.acknowledgedBy || 'Station Master'} • Recorded in duty log`
              : 'Requires Station Master formal confirmation to clear signal flags'}
          </div>
        </div>

        <button
          type="button"
          onClick={onAcknowledge}
          disabled={isAck || acknowledging}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isAck
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
          }`}
        >
          {acknowledging ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Recording...</span>
            </>
          ) : isAck ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Acknowledged</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Acknowledge Alert</span>
            </>
          )}
        </button>
      </div>

      {/* Affected Trains Section - Clickable */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Affected Trains (Click to inspect telemetry)
        </h4>

        {alert.affectedTrains && alert.affectedTrains.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {alert.affectedTrains.map((trainNum) => (
              <button
                key={trainNum}
                type="button"
                onClick={() => onSelectTrain(trainNum)}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-mono font-bold text-emerald-700 group-hover:text-emerald-800 flex items-center justify-between">
                  <span>Train #{trainNum}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Open Telemetry & Route</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            No specific rakes flagged. Applies to all movements in this zone.
          </div>
        )}
      </div>

      {/* Affected Platform if present */}
      {alert.platform && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Affected Platform (Click to inspect berth)
          </h4>
          <button
            type="button"
            onClick={() => onSelectPlatform(alert.platform.replace(/[^0-9]/g, ''))}
            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/30 text-left transition-all cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-xs font-bold text-slate-900">{alert.platform}</div>
                <div className="text-[10px] text-slate-500">Inspect track occupancy & queue</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  )
}
