import { useState, useEffect, useCallback } from 'react'
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
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { stationOpsService, apiClient } from '../services/api.js'
import { DetailPanel } from '../components/dashboard/DetailPanel.jsx'

export default function StationMasterDashboard() {
  const { stationId, stationName, user } = useAuth()
  const activeStation = stationId || 'NDLS'

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
    if (!isBackground) setLoading(true)
    else setRefreshing(true)

    try {
      // Call backend role dashboard or station operational endpoints
      const [roleRes, schedRes, arrivalsRes, departuresRes, platformsRes, alertsRes] = await Promise.all([
        apiClient.get('/dashboard/role').catch(() => null),
        stationOpsService.getSchedule(activeStation).catch(() => ({ trains: [] })),
        stationOpsService.getArrivals(activeStation).catch(() => ({ arrivals: [] })),
        stationOpsService.getDepartures(activeStation).catch(() => ({ departures: [] })),
        stationOpsService.getPlatforms(activeStation).catch(() => ({ platforms: [] })),
        stationOpsService.getAlerts(activeStation).catch(() => ({ alerts: [] })),
      ])

      if (roleRes && roleRes.station) {
        setStationData(roleRes)
      }

      setScheduleData(schedRes.trains || [])
      setArrivalsData(arrivalsRes.arrivals || [])
      setDeparturesData(departuresRes.departures || [])
      setPlatformData(platformsRes.platforms || [])
      setAlertsData(alertsRes.alerts || [])
    } catch (err) {
      console.error('Failed to load station operations:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeStation])

  useEffect(() => {
    fetchStationDashboard()
    const interval = setInterval(() => fetchStationDashboard(true), 30000) // 30s auto-refresh
    return () => clearInterval(interval)
  }, [fetchStationDashboard])

  const handleAcknowledgeAlert = async (alertId, e) => {
    if (e) e.stopPropagation()
    try {
      await stationOpsService.acknowledgeAlert(activeStation, alertId)
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
    onTimeRate: '88%',
    averageDelayMinutes: 14,
    activePlatforms: platformData.filter((p) => p.isOccupied).length || 6,
    totalPlatforms: platformData.length || 16,
  }

  const stationInfo = stationData?.station || {
    stationCode: activeStation,
    stationName: stationName || 'New Delhi Railway Station',
    city: 'New Delhi',
    crowdLevel: 'High',
    crowdPercentage: 78,
    weather: 'Clear Sky',
    temperature: '26°C',
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Station Master Operations Command</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {stationInfo.stationName} ({stationInfo.stationCode})
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time track allocation, platform occupancy & signal clearance monitoring
          </p>
        </div>

        {/* Station Environmental Telemetry */}
        <div className="flex flex-wrap items-center gap-3">
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
                      No trains matching current search filter for {activeStation}.
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
              No active operational alerts for station {activeStation}. All track circuits clear.
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
                    disabled={isAck}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                      isAck
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs'
                    }`}
                  >
                    {isAck ? 'Acknowledged' : 'Acknowledge'}
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Reusable Detail Drawer Component */}
      <DetailPanel
        isOpen={panelState.isOpen}
        onClose={closeDetail}
        type={panelState.type}
        id={panelState.id}
        stationCode={activeStation}
        onAlertAcknowledged={handlePanelAlertAcknowledged}
      />
    </div>
  )
}
