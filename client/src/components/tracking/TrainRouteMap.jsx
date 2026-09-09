import { useState } from 'react'
import { Plus, Minus, MapPin, Radio, TrainFront } from 'lucide-react'

export const TrainRouteMap = ({ train }) => {
  const [zoom, setZoom] = useState(1)

  if (!train) return null

  // Extract real stations from train timeline or route
  const stations = (train.timeline && train.timeline.length > 0)
    ? train.timeline
    : (train.allHaltStations && train.allHaltStations.length > 0)
    ? train.allHaltStations.map((s, idx, arr) => ({
        station: s.name,
        stationCode: s.code,
        type: idx === 0 ? 'Source' : idx === arr.length - 1 ? 'Destination' : 'Halt',
        status: 'Scheduled',
        complete: false,
      }))
    : [
        { station: train.sourceName || 'Origin', stationCode: train.sourceCode || 'SRC', type: 'Source', complete: true },
        { station: train.currentStationName || 'En Route', stationCode: train.currentStationCode || '', type: 'Current', status: 'Current', complete: true },
        { station: train.destName || 'Destination', stationCode: train.destinationCode || 'DEST', type: 'Destination', complete: false },
      ]

  const totalStops = stations.length
  const currentIdx = stations.findIndex((s) => s.status === 'Current' || s.stationCode === train.currentStationCode)
  const validCurrentIdx = currentIdx >= 0 ? currentIdx : Math.floor((train.progress / 100) * totalStops)

  // Map station points dynamically along an SVG curve (SVG width: 220, height: 160)
  const svgPoints = stations.map((s, idx) => {
    const t = totalStops > 1 ? idx / (totalStops - 1) : 0.5
    // S-curve interpolation across map canvas
    const x = 35 + t * 150 + Math.sin(t * Math.PI) * 15
    const y = 140 - t * 110 + Math.cos(t * Math.PI * 1.5) * 10
    return { ...s, x, y, idx }
  })

  // Build SVG path string connecting the stations
  let pathD = ''
  if (svgPoints.length > 0) {
    pathD = `M ${svgPoints[0].x},${svgPoints[0].y}`
    for (let i = 1; i < svgPoints.length; i++) {
      const prev = svgPoints[i - 1]
      const curr = svgPoints[i]
      const cx = (prev.x + curr.x) / 2
      const cy = (prev.y + curr.y) / 2
      pathD += ` Q ${prev.x},${cy} ${curr.x},${curr.y}`
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          Live Route Track ({train.trainNumber})
        </h4>
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-300">
          <Radio className="w-2.5 h-2.5 animate-pulse" />
          {train.dataSource === 'RAILRADAR' ? 'RailRadar GIS' : 'Route Grid'}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative h-48 w-full bg-[#f8fafc] rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, #f8fafc 1px)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        />

        {/* Dynamic Route SVG */}
        <svg
          viewBox="0 0 220 160"
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Base Corridor Geometry */}
          <path
            d={pathD}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Active / Traversed Track Segment */}
          <path
            d={pathD}
            fill="none"
            stroke="#059669"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Render Station Nodes along the route */}
          {svgPoints.map((s, idx) => {
            const isSource = idx === 0
            const isDest = idx === totalStops - 1
            const isCurrent = idx === validCurrentIdx
            const isHalt = isSource || isDest || idx % Math.max(1, Math.floor(totalStops / 6)) === 0

            if (!isHalt && !isCurrent) return null

            return (
              <g key={s.stationCode || idx}>
                {isCurrent && (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="8"
                    fill="#10b981"
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={isSource || isDest ? 4.5 : isCurrent ? 5 : 3}
                  fill={isCurrent ? '#059669' : isSource || isDest ? '#0f172a' : '#64748b'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={s.x + (idx % 2 === 0 ? 6 : -6)}
                  y={s.y + (idx % 2 === 0 ? 3 : -4)}
                  textAnchor={idx % 2 === 0 ? 'start' : 'end'}
                  fontSize={isSource || isDest || isCurrent ? '7.5' : '6'}
                  fontWeight={isSource || isDest || isCurrent ? 'bold' : 'normal'}
                  fill={isCurrent ? '#047857' : '#1e293b'}
                >
                  {s.stationCode || (s.station ? s.station.slice(0, 4).toUpperCase() : '')}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Current Location Badge overlay */}
        <div className="absolute left-2.5 bottom-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs flex items-center gap-1.5 text-[10px] font-bold text-slate-800">
          <TrainFront className="w-3 h-3 text-emerald-600" />
          <span>{train.currentStationName || train.currentStation || 'En Route'}</span>
          <span className="text-emerald-700 font-mono font-bold">({train.progress}%)</span>
        </div>

        {/* Zoom Controls */}
        <div className="absolute right-2.5 bottom-2.5 flex flex-col gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z + 0.2, 1.8))}
            className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.8))}
            className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
