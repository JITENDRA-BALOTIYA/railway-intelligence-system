import React, { useState } from 'react'
import {
  X,
  MapPin,
  Train,
  Activity,
  Zap,
  Radio,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Layers,
  ChevronRight,
  ShieldAlert,
  Gauge,
  Info,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function StationDetailDrawer({
  selectedItem,
  onClose,
  stationStatusData,
  loadingStatus,
}) {
  const [timeRange, setTimeRange] = useState('24h')

  if (!selectedItem || !selectedItem.data) return null

  const { type, data } = selectedItem // type: 'station' | 'segment' | 'train'

  // Extract normalized fields safely
  const stnCode = data.stationCode || data.code || 'IR'
  const stnName = data.stationName || data.name || stnCode
  const latVal = typeof (data.latitude ?? data.lat) === 'number' ? (data.latitude ?? data.lat) : 28.6419
  const lngVal = typeof (data.longitude ?? data.lng) === 'number' ? (data.longitude ?? data.lng) : 77.2207
  const stnCongestion = data.congestionPercentage ?? data.congestion ?? 68

  const segFrom = data.fromName || data.from || 'ORIGIN'
  const segTo = data.toName || data.to || 'DEST'
  const segCongestion = data.sectionCongestionPercentage ?? data.congestion ?? 75
  const segDistance = data.distanceKm || 120
  const segSpeed = data.averageSpeedKmph ?? data.avgSpeed ?? 68

  const trnNumber = data.trainNumber || data.number || '12004'
  const trnName = data.trainName || data.name || 'Express Rake'
  const trnSpeed = data.currentSpeedKmph ?? data.speed ?? 82
  const trnDelay = data.delayMinutes ?? data.delay ?? 0

  // Generate dynamic realistic historical telemetry points based on current congestion
  const baseCongestion =
    type === 'station' ? stnCongestion : type === 'segment' ? segCongestion : 55

  const generateHistoryData = (range) => {
    const pointsCount = range === '1h' ? 6 : range === '6h' ? 8 : range === '24h' ? 12 : 7
    const result = []
    const now = new Date()

    for (let i = pointsCount - 1; i >= 0; i--) {
      let timeLabel = ''
      if (range === '1h') {
        timeLabel = `${i * 10}m ago`
      } else if (range === '6h') {
        timeLabel = `${i * 45}m ago`
      } else if (range === '24h') {
        const h = (now.getHours() - i * 2 + 24) % 24
        timeLabel = `${String(h).padStart(2, '0')}:00`
      } else {
        const d = new Date()
        d.setDate(d.getDate() - i)
        timeLabel = d.toLocaleDateString('en-US', { weekday: 'short' })
      }

      const variation = Math.sin(i * 0.8) * 14 + (Math.random() * 6 - 3)
      const congestionVal = Math.min(99, Math.max(25, Math.round(baseCongestion + variation)))
      const delayVal = Math.max(0, Math.round((congestionVal - 40) * 0.75))

      result.push({
        time: timeLabel,
        congestion: congestionVal,
        delay: delayVal,
      })
    }
    return result
  }

  const chartData = generateHistoryData(timeRange)

  // Incoming trains parsing
  const incomingList = stationStatusData?.incomingTrains || data.liveTrains || [
    { number: '12423', name: 'Rajdhani Express', eta: '12m', platform: 'PF 4', status: 'On Time' },
    { number: '12004', name: 'Lucknow Shatabdi', eta: '26m', platform: 'PF 1', status: '+15m Delay' },
  ]

  const totalPlatforms = stationStatusData?.platforms?.total ?? data.platforms ?? 10
  const occupiedPlatforms = stationStatusData?.platforms?.occupied ?? data.occupiedPlatforms ?? 8
  const freePlatforms = Math.max(0, totalPlatforms - occupiedPlatforms)

  return (
    <div
      style={{ zIndex: 2000 }}
      className="absolute top-3 right-3 bottom-3 w-84 sm:w-96 bg-[#0c1222]/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden text-slate-200 animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          {type === 'station' && (
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <MapPin className="w-4 h-4" />
            </span>
          )}
          {type === 'segment' && (
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Activity className="w-4 h-4" />
            </span>
          )}
          {type === 'train' && (
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Train className="w-4 h-4" />
            </span>
          )}
          <div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              {type === 'station'
                ? 'STATION INTELLIGENCE'
                : type === 'segment'
                ? 'BLOCK SECTION INTELLIGENCE'
                : 'TRAIN TELEMETRY'}
            </div>
            <div className="text-sm font-bold text-white leading-tight truncate max-w-[200px]">
              {type === 'station'
                ? `${stnName} (${stnCode})`
                : type === 'segment'
                ? `${data.from} ➔ ${data.to}`
                : `#${trnNumber} ${trnName}`}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close telemetry drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {/* TYPE: STATION */}
        {type === 'station' && (
          <>
            {/* Quick KPI badges */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">CONGESTION LEVEL</div>
                <div className="text-base font-black text-white font-mono mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      stnCongestion > 80
                        ? 'bg-rose-500 animate-pulse'
                        : stnCongestion > 50
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span>{stnCongestion}%</span>
                </div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                  {stnCongestion > 80 ? 'Heavy Saturation' : 'Moderate Headway'}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">PLATFORM CAPACITY</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {occupiedPlatforms} / {totalPlatforms}
                </div>
                <div className="text-[9px] text-emerald-400 font-mono mt-0.5">
                  {freePlatforms} Platforms Clear
                </div>
              </div>
            </div>

            {/* Operational Telemetry Grid */}
            <div className="space-y-2 p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                SUBSYSTEM INTEGRITY
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>OHE Traction:</span>
                </span>
                <span className="text-emerald-400 font-bold">
                  {stationStatusData?.oheStatus || data.oheStatus || '25 kV AC 50Hz (Nominal)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-sky-400" />
                  <span>Signaling / Interlocking:</span>
                </span>
                <span className="text-sky-300 font-bold">
                  {stationStatusData?.signaling || data.signalStatus || 'Electronic Interlocking (EI)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>Passenger Crowd Density:</span>
                </span>
                <span className="text-amber-300 font-bold">
                  {stationStatusData?.crowdDensity || data.passengerDensity || '76% (High Surge)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-slate-400" />
                  <span>Geographic Coords:</span>
                </span>
                <span className="text-slate-300 font-bold">
                  {latVal.toFixed(4)}, {lngVal.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Scheduled Rakes Approaching */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                <span>APPROACHING TRAINS ({incomingList.length})</span>
                <span className="text-sky-400">Live Radar</span>
              </div>

              <div className="space-y-1.5">
                {incomingList.slice(0, 4).map((t, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-200">
                        #{t.trainNumber || t.number} {t.trainName || t.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Assigned: <strong className="text-sky-400">{t.platform || 'PF 1'}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">
                        ETA {t.eta || t.expectedArrival || '12m'}
                      </div>
                      <div
                        className={`text-[9px] font-mono ${
                          (t.delayText || t.status || '').includes('Late') || (t.delay || 0) > 0
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {t.delayText || (t.delay > 0 ? `+${t.delay}m Delay` : 'On Time')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TYPE: SEGMENT */}
        {type === 'segment' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">SECTION SATURATION</div>
                <div className="text-base font-black text-white font-mono mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      segCongestion > 80
                        ? 'bg-rose-500'
                        : segCongestion > 50
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span>{segCongestion}%</span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  {segCongestion > 80 ? 'Critical Chokepoint' : 'Operating within PSR'}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">DISTANCE & SPEED</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {segDistance} km
                </div>
                <div className="text-[9px] text-amber-400 font-mono mt-0.5">
                  Avg Speed: {segSpeed} km/h
                </div>
              </div>
            </div>

            {/* Block Section Telemetry */}
            <div className="space-y-2 p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                SECTION SPECIFICATIONS
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Permissible Speed (PSR):</span>
                <span className="text-slate-200 font-bold">130 km/h</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Block System:</span>
                <span className="text-emerald-400 font-bold">
                  {data.trackStatus || 'Quadruple Track Quad Line'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Headway Interval:</span>
                <span className="text-amber-300 font-bold">
                  {data.capacityUtilization || '101% Capacity'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono py-1">
                <span className="text-slate-400">Signal Status:</span>
                <span className="text-sky-400 font-bold">
                  {data.signalStatus || 'Automatic Cab Signaling'}
                </span>
              </div>
            </div>

            {/* AI Recommendation if congested */}
            {segCongestion > 70 && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>AI Dynamic Mitigation Active</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Heavy rake queue detected approaching this block. Recommended diverting freight
                  consignment #FG-8821 to Eastern Dedicated Freight Corridor (EDFC) loop to restore
                  high-speed passenger headway.
                </p>
              </div>
            )}
          </>
        )}

        {/* TYPE: TRAIN */}
        {type === 'train' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">LIVE SPEED</div>
                <div className="text-base font-black text-sky-400 font-mono mt-0.5">
                  {trnSpeed} km/h
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  GPS Telemetry: Active
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">SCHEDULE STATUS</div>
                <div
                  className={`text-base font-black font-mono mt-0.5 ${
                    trnDelay > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {trnDelay > 0 ? `+${trnDelay}m Delay` : 'On Schedule'}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  Priority Corridor Rake
                </div>
              </div>
            </div>

            <div className="space-y-2 p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                TRAIN RADAR TELEMETRY
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Train Number:</span>
                <span className="text-slate-200 font-bold">#{trnNumber}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Train Name:</span>
                <span className="text-sky-300 font-bold truncate max-w-[170px]">{trnName}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Current Position:</span>
                <span className="text-slate-200 font-bold">
                  {data.currentStationName || data.currentStation || 'Block Section KM 184'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono py-1">
                <span className="text-slate-400">Next Destination:</span>
                <span className="text-emerald-400 font-bold">
                  {data.nextStationName || data.nextStation || 'Next Station'} ({data.eta || '15m'})
                </span>
              </div>
            </div>
          </>
        )}

        {/* HISTORICAL CHARTS (ALL TYPES) */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-slate-300">
              <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
              <span>CONGESTION & DELAY HISTORY</span>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-0.5 rounded-md font-mono text-[9px]">
              {['1h', '6h', '24h', '7d'].map((rng) => (
                <button
                  key={rng}
                  onClick={() => setTimeRange(rng)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    timeRange === rng
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rng}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-36 w-full bg-slate-900/50 rounded-lg p-2 border border-slate-800/80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="congestionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={9}
                  tickLine={false}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={9}
                  tickLine={false}
                  domain={[0, 100]}
                  fontFamily="monospace"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                  }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Area
                  type="monotone"
                  dataKey="congestion"
                  name="Congestion %"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#congestionGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span>Historical Saturation Timeline</span>
            <span className="text-sky-400">Peak: {Math.max(...chartData.map((d) => d.congestion))}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
