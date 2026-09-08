import { Users, AlertTriangle, MapPin } from 'lucide-react'

export const StationCrowdCard = ({ stationData }) => {
  if (!stationData) return null

  const getCrowdBadgeStyle = (level) => {
    const l = (level || '').toLowerCase()
    if (l.includes('extreme') || l.includes('high')) return 'bg-rose-50 text-rose-700 border-rose-200'
    if (l.includes('moderate')) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{stationData.stationName}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{stationData.city}</span>
              <span className="font-mono text-emerald-700 font-semibold">({stationData.stationCode})</span>
            </div>
          </div>
        </div>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${getCrowdBadgeStyle(
            stationData.crowdLevel,
          )}`}
        >
          {stationData.crowdLevel} Density
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <div className="text-2xl font-extrabold font-mono text-slate-900">{stationData.crowdPercentage}%</div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Platform Load</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <div className="text-2xl font-extrabold font-mono text-slate-900">{stationData.activeTrainsCount}</div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Active Trains</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <div className="text-sm font-bold text-slate-900 mt-1">{stationData.weather?.condition || stationData.weather}</div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Weather</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <div className="text-sm font-bold text-emerald-700 mt-1">{stationData.weather?.visibility || stationData.visibility}</div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Visibility</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
          <span>Platform Capacity Utilization</span>
          <span className="font-mono text-emerald-700">{stationData.crowdPercentage}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              stationData.crowdPercentage > 80
                ? 'bg-rose-500'
                : stationData.crowdPercentage > 50
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${stationData.crowdPercentage}%` }}
          />
        </div>
      </div>

      {/* Recommendation */}
      {stationData.crowdRecommendation && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{stationData.crowdRecommendation}</span>
        </div>
      )}
    </div>
  )
}
