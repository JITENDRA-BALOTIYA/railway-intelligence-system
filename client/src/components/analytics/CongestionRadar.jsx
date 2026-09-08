import { AlertTriangle } from 'lucide-react'

export const CongestionRadar = ({ corridors = [] }) => {
  if (!corridors.length) return null

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase()
    if (s.includes('severe') || s.includes('extreme')) return 'border-rose-200 bg-rose-50/60 text-rose-700'
    if (s.includes('high')) return 'border-amber-200 bg-amber-50/60 text-amber-700'
    if (s.includes('moderate')) return 'border-blue-200 bg-blue-50/60 text-blue-700'
    return 'border-emerald-200 bg-emerald-50/60 text-emerald-700'
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        Railway Corridor Bottleneck Status
      </h3>

      <div className="space-y-3">
        {corridors.map((c, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border ${getStatusColor(c.status)} flex items-center justify-between`}
          >
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{c.corridor}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                Avg Delay: {c.avgDelay} min • Capacity: {c.capacity}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-lg font-bold font-mono text-slate-900">{c.congestionIndex}</div>
                <div className="text-[9px] text-slate-400 font-bold">INDEX</div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-current whitespace-nowrap bg-white/80">
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
