import { Gauge, MapPin, Clock, ExternalLink } from 'lucide-react'

const TAG_COLORS = {
  Rajdhani: 'bg-rose-100 text-rose-700 border-rose-200',
  Superfast: 'bg-orange-100 text-orange-700 border-orange-200',
  Express: 'bg-sky-100 text-sky-700 border-sky-200',
  LHB: 'bg-violet-100 text-violet-700 border-violet-200',
  Mail: 'bg-amber-100 text-amber-700 border-amber-200',
}

export const TrainInfoPanel = ({ trainInfo }) => {
  if (!trainInfo) return null

  const {
    trainNumber, trainName, tags = [], route, runDays,
    speed, avgSpeed, nextStation, nextStationKm, eta, platform, lastUpdated,
  } = trainInfo

  const speedPct = Math.min(100, Math.round((speed / 160) * 100))

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-slate-800">Train Information</span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Tracking
          </span>
        </div>
      </div>

      {/* Train image & name */}
      <div className="px-4 py-3 border-b border-slate-100">
        {/* Placeholder train image */}
        <div className="w-full h-20 rounded-xl bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 flex items-center justify-center mb-3 overflow-hidden relative">
          {/* Abstract train silhouette */}
          <div className="flex items-center gap-1">
            <div className="w-16 h-8 bg-orange-400 rounded-sm relative">
              <div className="absolute bottom-0 left-1 w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-400" />
              <div className="absolute bottom-0 right-1 w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-400" />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-12 h-6 bg-orange-300/80 rounded-sm relative">
                <div className="absolute bottom-0 left-0.5 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-slate-400" />
                <div className="absolute bottom-0 right-0.5 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-slate-400" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="text-2xl font-extrabold text-slate-900 font-mono leading-none">{trainNumber}</div>
        <div className="text-sm font-semibold text-slate-700 mt-0.5">{trainName}</div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${TAG_COLORS[tag] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-2 text-[11px] text-slate-500 font-mono">{route} · {runDays}</div>
        <button
          type="button"
          className="mt-1.5 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          View Full Train Details <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Current Status */}
      <div className="px-4 py-3 flex-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Current Status</div>

        {/* Speed gauge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="text-3xl font-extrabold text-slate-900 font-mono leading-none">{speed}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">km/h</div>
            <div className="text-[10px] text-slate-400">(Avg {avgSpeed} km/h)</div>
          </div>
          {/* Circular gauge */}
          <div className="w-20 h-20 relative">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#e2e8f0" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke={speed >= avgSpeed ? '#059669' : '#f59e0b'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - speedPct / 100)}`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Gauge className={`w-5 h-5 ${speed >= avgSpeed ? 'text-emerald-500' : 'text-amber-500'}`} />
            </div>
          </div>
        </div>

        {/* Status grid */}
        <div className="space-y-2">
          {[
            { label: 'Delay', value: `+${trainInfo.speed ? Math.max(0, Math.round((avgSpeed - speed) * 0.5)) : 8} min`, color: 'text-rose-600' },
            { label: 'Next Station', value: `${nextStation?.split(' - ')[0] || nextStation} (${nextStationKm} km)`, color: 'text-slate-800' },
            { label: 'ETA', value: eta || '—', color: 'text-slate-800' },
            { label: 'Platform', value: platform || '—', color: 'text-slate-800' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{row.label}</span>
              <span className={`font-bold font-mono ${row.color}`}>{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 text-[10px] text-slate-400 text-right">Last Updated {lastUpdated}</div>
      </div>
    </div>
  )
}
