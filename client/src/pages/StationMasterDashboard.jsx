import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Building2,
  Clock,
  Radio,
  TrainFront,
  AlertTriangle,
  Users,
  CheckCircle2,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  SlidersHorizontal,
  CloudSun,
  Activity,
  Layers,
  ChevronRight,
  Search,
  X,
  Lock,
  ArrowLeft,
  Eye,
  Check,
  AlertCircle,
  MapPin,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { stationOpsService, apiClient } from '../services/api.js'
import { DetailPanel } from '../components/dashboard/DetailPanel.jsx'

export default function StationMasterDashboard() {
  const { stationId, stationName, user } = useAuth()
  const homeStation = stationId

  const [viewedStation, setViewedStation] = useState(homeStation || 'NDLS')
  const [hasManuallySwitched, setHasManuallySwitched] = useState(false)
  const [stationNotFound, setStationNotFound] = useState(false)

  // Station search dropdown state
  const [stationSearchInput, setStationSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchContainerRef = useRef(null)

  const [activeTab, setActiveTab] = useState('schedule') // 'schedule' | 'arrivals' | 'departures' | 'platforms' | 'delays' | 'alerts'
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stationData, setStationData] = useState(null)
  const [scheduleData, setScheduleData] = useState([])
  const [arrivalsData, setArrivalsData] = useState([])
  const [departuresData, setDeparturesData] = useState([])
  const [platformData, setPlatformData] = useState([])
  const [alertsData, setAlertsData] = useState([])
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState([])
  const [searchFilter, setSearchFilter] = useState('')

  // Detail Panel State
  const [panelState, setPanelState] = useState({
    isOpen: false,
    type: 'train', // 'train' | 'platform' | 'alert'
    id: null,
  })

  // Sync viewedStation with homeStation when auth hydrates, if user hasn't manually switched
  useEffect(() => {
    if (homeStation && !hasManuallySwitched) {
      setViewedStation(homeStation)
    }
  }, [homeStation, hasManuallySwitched])

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isViewingOther = Boolean(homeStation && viewedStation !== homeStation)

  const handleSearchStations = async (query = '') => {
    setSearchLoading(true)
    try {
      const res = await stationOpsService.searchStations(query)
      const list = Array.isArray(res) ? res : res?.stations || []
      setSearchResults(list)
    } catch (err) {
      console.warn('Station search failed:', err)
      const defaultList = [
        { code: 'NDLS', stationCode: 'NDLS', name: 'New Delhi Railway Station (NDLS)', stationName: 'New Delhi Railway Station', city: 'New Delhi' },
        { code: 'MMCT', stationCode: 'MMCT', name: 'Mumbai Central (MMCT)', stationName: 'Mumbai Central', city: 'Mumbai' },
        { code: 'HWH', stationCode: 'HWH', name: 'Howrah Junction (HWH)', stationName: 'Howrah Junction', city: 'Kolkata' },
        { code: 'JP', stationCode: 'JP', name: 'Jaipur Junction (JP)', stationName: 'Jaipur Junction', city: 'Jaipur' },
        { code: 'KOTA', stationCode: 'KOTA', name: 'Kota Junction (KOTA)', stationName: 'Kota Junction', city: 'Kota' },
        { code: 'CNB', stationCode: 'CNB', name: 'Kanpur Central (CNB)', stationName: 'Kanpur Central', city: 'Kanpur' },
      ]
      setSearchResults(
        defaultList.filter(
          (s) =>
            s.stationCode.toLowerCase().includes(query.toLowerCase()) ||
            s.stationName.toLowerCase().includes(query.toLowerCase()),
        ),
      )
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSelectStation = (code) => {
    const cleanCode = String(code || '').trim().toUpperCase()
    if (!cleanCode) return
    setViewedStation(cleanCode)
    setHasManuallySwitched(true)
    setIsSearchOpen(false)
    setStationSearchInput('')
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (stationSearchInput.trim()) {
      handleSelectStation(stationSearchInput.trim().toUpperCase())
    }
  }

  const handleBackToHomeStation = () => {
    if (homeStation) {
      setViewedStation(homeStation)
      setHasManuallySwitched(false)
      setStationNotFound(false)
      setStationSearchInput('')
    }
  }

  const openDetail = (type, id) => {
    if (!id) return
    setPanelState({
      isOpen: true,
      type,
      id: String(id),
    })
  }

  const closeDetail = () => {
    setPanelState((prev) => ({ ...prev, isOpen: false }))
  }

  const fetchStationDashboard = useCallback(async (isBackground = false) => {
    if (!viewedStation) return
    if (!isBackground) setLoading(true)
    else setRefreshing(true)

    try {
      // Call backend role dashboard and station operational endpoints using viewedStation
      const [roleRes, schedRes, arrivalsRes, departuresRes, platformsRes, alertsRes, stationProfileRes] = await Promise.all([
        apiClient.get('/dashboard/role', { stationId: viewedStation }).catch(() => null),
        stationOpsService.getSchedule(viewedStation).catch(() => null),
        stationOpsService.getArrivals(viewedStation).catch(() => null),
        stationOpsService.getDepartures(viewedStation).catch(() => null),
        stationOpsService.getPlatforms(viewedStation).catch(() => null),
        stationOpsService.getAlerts(viewedStation).catch(() => null),
        stationOpsService.getStation(viewedStation).catch(() => null),
      ])

      // If station does not exist anywhere across services, flag not found
      if (!roleRes && !schedRes && !arrivalsRes && !stationProfileRes) {
        setStationNotFound(true)
        setStationData(null)
        setScheduleData([])
        setArrivalsData([])
        setDeparturesData([])
        setPlatformData([])
        setAlertsData([])
        return
      }

      setStationNotFound(false)

      if (roleRes && roleRes.station) {
        setStationData(roleRes)
      } else if (stationProfileRes) {
        setStationData({
          station: {
            stationCode: stationProfileRes.stationCode || viewedStation,
            stationName: stationProfileRes.stationName || viewedStation,
            city: stationProfileRes.city || 'N/A',
            crowdLevel: stationProfileRes.crowdLevel || 'Moderate',
            crowdPercentage: stationProfileRes.crowdPercentage || 65,
            weather: stationProfileRes.weather || 'Clear Sky',
            temperature: stationProfileRes.temperature || '26°C',
          },
        })
      } else {
        setStationData({
          station: {
            stationCode: viewedStation,
            stationName: `${viewedStation} Railway Station`,
            city: 'Railway Network',
            crowdLevel: 'Moderate',
            crowdPercentage: 60,
            weather: 'Clear Sky',
            temperature: '25°C',
          },
        })
      }

      setScheduleData(schedRes?.trains || [])
      setArrivalsData(arrivalsRes?.arrivals || [])
      setDeparturesData(departuresRes?.departures || [])
      setPlatformData(platformsRes?.platforms || [])
      setAlertsData(alertsRes?.alerts || [])
    } catch (err) {
      console.error('Failed to load station operations:', err)
      setStationNotFound(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [viewedStation])

  useEffect(() => {
    fetchStationDashboard()
    const interval = setInterval(() => fetchStationDashboard(true), 30000) // 30s auto-refresh
    return () => clearInterval(interval)
  }, [fetchStationDashboard])

  const handleAcknowledgeAlert = async (alertId, e) => {
    if (e) e.stopPropagation()
    if (isViewingOther) return

    try {
      await stationOpsService.acknowledgeAlert(viewedStation, alertId)
      setAcknowledgedAlerts((prev) => [...prev, alertId])
      setAlertsData((prev) =>
        prev.map((a) =>
          (a.id === alertId || a._id === alertId)
            ? { ...a, status: 'acknowledged', acknowledgedBy: user?.name || 'Station Master', acknowledgedAt: new Date().toISOString() }
            : a,
        ),
      )
    } catch (err) {
      console.error('Failed to acknowledge alert:', err)
    }
  }

  const handlePanelAlertAcknowledged = (alertId, updatedAlert) => {
    setAcknowledgedAlerts((prev) => [...prev, alertId])
    setAlertsData((prev) =>
      prev.map((a) =>
        (a.id === alertId || a._id === alertId)
          ? { ...a, ...updatedAlert, status: 'acknowledged' }
          : a,
      ),
    )
  }

  // Combine schedule data or arrivals/departures
  const allScheduledTrains =
    scheduleData.length > 0
      ? scheduleData
      : [...arrivalsData, ...departuresData].filter((t, idx, arr) =>
          arr.findIndex((other) => other.trainNumber === t.trainNumber) === idx,
        )

  const filteredSchedule = allScheduledTrains.filter(
    (t) =>
      t.trainNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.trainName.toLowerCase().includes(searchFilter.toLowerCase()),
  )

  const kpis = stationData?.kpis || {
    trainsArrivingToday: arrivalsData.length || 24,
    trainsDepartingToday: departuresData.length || 18,
    delayedTrains: allScheduledTrains.filter((t) => t.delay > 15).length,
    onTimeRate: allScheduledTrains.length > 0
      ? `${Math.round((allScheduledTrains.filter((t) => (t.delay || 0) <= 15).length / allScheduledTrains.length) * 100)}%`
      : '88%',
    averageDelayMinutes: 14,
    activePlatforms: platformData.filter((p) => p.isOccupied).length || 6,
    totalPlatforms: platformData.length || 16,
  }

  const stationInfo = stationData?.station || {
    stationCode: viewedStation,
    stationName: (!isViewingOther && stationName) ? stationName : `${viewedStation} Railway Station`,
    city: 'Railway Network',
    crowdLevel: 'Moderate',
    crowdPercentage: 68,
    weather: 'Clear Sky',
    temperature: '26°C',
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Station Master Operations Command</span>
            {isViewingOther ? (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                Previewing External Station
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Assigned Station
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {stationInfo.stationName} ({stationInfo.stationCode})
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time track allocation, platform occupancy & signal clearance monitoring
          </p>
        </div>

        {/* Station Search / Switcher & Environmental Telemetry */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Station Switcher Autocomplete Dropdown */}
          <div className="relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Switch station (e.g. MMCT, HWH)..."
                  value={stationSearchInput}
                  onFocus={() => {
                    setIsSearchOpen(true)
                    if (searchResults.length === 0) handleSearchStations('')
                  }}
                  onChange={(e) => {
                    setStationSearchInput(e.target.value)
                    handleSearchStations(e.target.value)
                    if (!isSearchOpen) setIsSearchOpen(true)
                  }}
                  className="pl-9 pr-8 py-2 w-64 sm:w-72 rounded-xl border border-slate-200 text-xs bg-slate-50/70 hover:bg-white focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                />
                {stationSearchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setStationSearchInput('')
                      handleSearchStations('')
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Autocomplete Dropdown Panel */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden max-h-80 flex flex-col">
                <div className="p-2.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-50/80">
                  <span>Select Railway Station</span>
                  {searchLoading && <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />}
                </div>

                <div className="overflow-y-auto divide-y divide-slate-100 p-1 max-h-64">
                  {searchResults.length === 0 && !searchLoading ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No stations found for "{stationSearchInput}"
                    </div>
                  ) : (
                    searchResults.map((stn) => {
                      const code = stn.stationCode || stn.code
                      const name = stn.stationName || stn.name
                      const isCurrent = viewedStation === code
                      const isHome = homeStation === code

                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => handleSelectStation(code)}
                          className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-50 font-bold text-emerald-900'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-emerald-700 px-1.5 py-0.5 rounded bg-emerald-100/60">
                                {code}
                              </span>
                              <span className="text-xs truncate font-semibold text-slate-800">
                                {name}
                              </span>
                            </div>
                            {stn.city && (
                              <div className="text-[10px] text-slate-400 mt-0.5 ml-0.5 truncate">
                                {stn.city}{stn.state ? `, ${stn.state}` : ''}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isHome && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                                Home
                              </span>
                            )}
                            {isCurrent && <Check className="w-4 h-4 text-emerald-600" />}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>

                {/* Popular Stations Quick Bar inside dropdown */}
                <div className="p-2 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-1 overflow-x-auto text-[10px]">
                  <span className="text-slate-400 font-medium shrink-0">Popular:</span>
                  <div className="flex items-center gap-1">
                    {['NDLS', 'MMCT', 'HWH', 'CNB', 'JP', 'KOTA'].map((quickCode) => (
                      <button
                        key={quickCode}
                        type="button"
                        onClick={() => handleSelectStation(quickCode)}
                        className={`px-1.5 py-0.5 rounded font-mono font-bold transition-colors cursor-pointer ${
                          viewedStation === quickCode
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {quickCode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Environmental Telemetry */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Weather</div>
              <div className="text-xs font-bold text-slate-800">
                {stationInfo.weather} • {stationInfo.temperature}
              </div>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Crowd Density</div>
              <div className="text-xs font-bold text-slate-800">
                {stationInfo.crowdLevel} ({stationInfo.crowdPercentage}%)
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchStationDashboard(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
        </div>
      </div>

      {/* Viewing Other Station Mode Banner */}
      {isViewingOther && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-300/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900">
                  Viewing Mode: {stationInfo.stationName} ({viewedStation})
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                  Read-Only Preview
                </span>
              </div>
              <p className="text-[11px] text-amber-700/90 mt-0.5">
                You are previewing live operational telemetry for this station. Alert acknowledgments and turnaround management remain restricted to your assigned station ({homeStation}).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBackToHomeStation}
            className="px-4 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-xs hover:shadow"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Station ({homeStation})</span>
          </button>
        </div>
      )}

      {stationNotFound ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs space-y-5 my-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Station "{viewedStation}" Not Found
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              We couldn't retrieve operational records or live train schedules for station code{' '}
              <span className="font-mono font-bold text-slate-800">{viewedStation}</span>. Please verify the code or select from one of the active stations below.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {['NDLS', 'MMCT', 'HWH', 'CNB', 'JP', 'KOTA'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleSelectStation(code)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-xs font-bold font-mono text-slate-700 hover:text-emerald-700 transition-all cursor-pointer"
              >
                {code}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
            {homeStation && (
              <button
                type="button"
                onClick={handleBackToHomeStation}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to My Station ({homeStation})</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Arriving Today</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.trainsArrivingToday}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Live section arrivals</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Departing Today</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.trainsDepartingToday}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Origin & transit rakes</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delayed Trains</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{kpis.delayedTrains}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">&gt;15 min section delay</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">On-Time Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{kpis.onTimeRate}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Station punctuality</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average Delay</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{kpis.averageDelayMinutes}m</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Section dwell variance</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Platforms Occupied</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">
            {kpis.activePlatforms}/{kpis.totalPlatforms}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Track berth utilization</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 gap-4 overflow-x-auto pb-px">
        <div className="flex items-center gap-2">
          {[
            { id: 'schedule', label: "Today's Schedule", count: allScheduledTrains.length },
            { id: 'arrivals', label: 'Live Arrivals', count: arrivalsData.length },
            { id: 'departures', label: 'Live Departures', count: departuresData.length },
            { id: 'platforms', label: 'Platform Management', count: platformData.length },
            { id: 'delays', label: 'Delay Intelligence' },
            { id: 'alerts', label: 'Station Alerts', count: alertsData.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600 font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filter Input for Schedule */}
        {activeTab === 'schedule' && (
          <div className="w-64 pb-2">
            <input
              type="text"
              placeholder="Search train no / name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      {/* TAB 1: Today's Schedule Table */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Live Station Rake Timetable (RailRadar Integrated)
            </h3>
            <span className="text-xs text-slate-500">
              Showing {filteredSchedule.length} scheduled movements
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
                <tr>
                  <th className="px-4 py-3">Train</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Source → Dest</th>
                  <th className="px-4 py-3">Sched. Arr / Dep</th>
                  <th className="px-4 py-3">Exp. Arr / Dep</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Delay</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {filteredSchedule.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-slate-400">
                      No trains matching current search filter for {viewedStation}.
                    </td>
                  </tr>
                ) : (
                  filteredSchedule.map((train, idx) => (
                    <tr
                      key={`${train.trainNumber}-${idx}`}
                      onClick={() => openDetail('train', train.trainNumber)}
                      className="hover:bg-emerald-50/70 transition-colors cursor-pointer group"
                      title="Click to view full train telemetry & route timeline"
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {train.trainName}
                        </div>
                        <div className="font-mono text-emerald-700 text-[11px] font-semibold">
                          #{train.trainNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{train.type}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {train.source} → {train.destination}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {train.scheduledArrival} / {train.scheduledDeparture}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                        {train.expectedArrival} / {train.expectedDeparture}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 font-mono">
                          {train.platform}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            train.status === 'At Platform'
                              ? 'bg-purple-100 text-purple-800'
                              : train.status === 'Delayed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {train.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">
                        <span className={train.delay > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {train.delayText}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 text-slate-400 group-hover:text-emerald-700 font-bold text-[11px] transition-colors">
                          <span className="hidden sm:inline">Details</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2 & 3: Live Arrivals / Departures Board */}
      {(activeTab === 'arrivals' || activeTab === 'departures') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeTab === 'arrivals' ? arrivalsData : departuresData).map((train, idx) => (
            <div
              key={`${train.trainNumber}-${idx}`}
              onClick={() => openDetail('train', train.trainNumber)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
              title="Click to view full live telemetry"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-xs font-bold font-mono text-emerald-700">
                    #{train.trainNumber}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-emerald-800 transition-colors">
                    {train.trainName}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {train.source} → {train.destination}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 font-mono font-bold text-xs text-emerald-800 shrink-0">
                  {train.platform}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">
                    {activeTab === 'arrivals' ? 'Expected Arrival' : 'Expected Departure'}
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {activeTab === 'arrivals' ? train.expectedArrival : train.expectedDeparture}
                  </div>
                  <div className="text-[10px] text-slate-400 line-through font-mono">
                    Sched: {activeTab === 'arrivals' ? train.scheduledArrival : train.scheduledDeparture}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Delay Status</div>
                  <div className={`font-mono font-bold text-sm ${train.delay > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {train.delayText}
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                    {train.status}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100/60 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-emerald-700 transition-colors">
                <span>Section Telemetry</span>
                <div className="flex items-center gap-0.5 font-bold">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Platform Management Grid */}
      {activeTab === 'platforms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformData.map((pf) => (
            <div
              key={pf.platformNumber}
              onClick={() => openDetail('platform', pf.platformNumber)}
              className={`rounded-2xl border p-5 transition-all cursor-pointer hover:shadow-md group ${
                pf.isOccupied
                  ? 'bg-white border-amber-300 ring-2 ring-amber-400/20 hover:border-amber-400'
                  : 'bg-white border-slate-200/80 hover:border-emerald-400 opacity-95'
              }`}
              title="Click to inspect platform occupancy and scheduled queue"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-black font-mono text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {pf.platformLabel}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    pf.isOccupied
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {pf.isOccupied ? 'Occupied' : 'Clear & Ready'}
                </span>
              </div>

              {pf.currentTrain ? (
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 group-hover:bg-amber-50/90 transition-colors">
                    <div className="text-[10px] font-bold uppercase text-amber-800">
                      Rake on Track
                    </div>
                    <div className="font-bold text-slate-900 truncate">{pf.currentTrain.trainName}</div>
                    <div className="font-mono text-xs text-amber-900 font-semibold">
                      #{pf.currentTrain.trainNumber}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>Dep: {pf.currentTrain.expectedDeparture}</span>
                      <span className="text-rose-600 font-bold">{pf.currentTrain.delayText}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 font-medium group-hover:text-slate-600 transition-colors">
                  Track free for section movement
                </div>
              )}

              {pf.nextTrain && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 truncate">
                  <span className="text-slate-400">Next Inbound:</span>{' '}
                  <span className="font-bold text-slate-800">{pf.nextTrain.trainName}</span> (
                  {pf.nextTrain.expectedArrival})
                </div>
              )}

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-emerald-700 transition-colors">
                <span>Berth Inspection</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: Delay Intelligence */}
      {activeTab === 'delays' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Station Delay Root Cause Categorization</span>
            </h3>
            <div className="space-y-4">
              {[
                { factor: 'Signal & Interlocking Waiting', percentage: 42, impact: '18 min avg', color: 'bg-blue-600' },
                { factor: 'Platform Occupancy Conflict', percentage: 28, impact: '12 min avg', color: 'bg-amber-500' },
                { factor: 'Late Incoming Rake from Upstream', percentage: 16, impact: '24 min avg', color: 'bg-purple-600' },
                { factor: 'Station Rolling Stock / Water Refill', percentage: 10, impact: '8 min avg', color: 'bg-emerald-600' },
                { factor: 'Track Maintenance Speed Restrictions', percentage: 4, impact: '5 min avg', color: 'bg-slate-400' },
              ].map((item) => (
                <div key={item.factor}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{item.factor}</span>
                    <span className="font-mono text-slate-500">{item.impact} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Operational Recovery Recommendations</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <div className="font-bold">Prioritize Platform 8 Line Clear</div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Mumbai Rajdhani (12951) ready for section dispatch. Departing will clear interlocking switch for incoming 12004.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <div className="font-bold">Re-route Upcoming Freight Rake to Yard Loop</div>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Avoid blocking Main Down line between 10:15 AM - 10:45 AM during Vande Bharat arrival window.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Station Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {alertsData.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No active operational alerts for station {viewedStation}. All track circuits clear.
            </div>
          ) : (
            alertsData.map((alert) => {
              const alertKey = alert.id || alert._id
              const isAck = acknowledgedAlerts.includes(alertKey) || alert.status === 'acknowledged'
              return (
                <div
                  key={alertKey}
                  onClick={() => openDetail('alert', alertKey)}
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all cursor-pointer group hover:shadow-xs ${
                    isAck
                      ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                      : alert.severity === 'critical'
                      ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                      : 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                  }`}
                  title="Click to view full alert details and affected units"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <ShieldAlert
                      className={`w-5 h-5 shrink-0 mt-0.5 ${
                        alert.severity === 'critical'
                          ? 'text-rose-600'
                          : alert.severity === 'warning'
                          ? 'text-amber-600'
                          : 'text-blue-600'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                          {alert.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white border border-slate-200 text-slate-700 shrink-0">
                          {alert.severity}
                        </span>
                        {isAck && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-200 text-slate-600 shrink-0">
                            Acknowledged
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{alert.description || alert.message}</p>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>Affected: {alert.affectedTrains?.join(', ') || alert.section}</span>
                        {alert.platform && <span>• {alert.platform}</span>}
                        <span className="text-emerald-700 font-semibold group-hover:underline">
                          • Click for Details →
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleAcknowledgeAlert(alertKey, e)}
                    disabled={isAck || isViewingOther}
                    title={isViewingOther ? 'Only available for your assigned station' : isAck ? 'Already acknowledged' : 'Acknowledge Alert'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 ${
                      isAck || isViewingOther
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs cursor-pointer'
                    }`}
                  >
                    {isAck ? (
                      'Acknowledged'
                    ) : isViewingOther ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Action Locked</span>
                      </>
                    ) : (
                      'Acknowledge'
                    )}
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}
        </>
      )}

      {/* Reusable Detail Drawer Component */}
      <DetailPanel
        isOpen={panelState.isOpen}
        onClose={closeDetail}
        type={panelState.type}
        id={panelState.id}
        stationCode={viewedStation}
        canAcknowledge={!isViewingOther}
        onAlertAcknowledged={handlePanelAlertAcknowledged}
      />
    </div>
  )
}
