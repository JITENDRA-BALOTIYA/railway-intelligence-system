import { CheckCircle2, Circle, Clock } from 'lucide-react'

export const RouteTimeline = ({ timeline = [], expanded = false }) => {
  if (!timeline || timeline.length === 0) return null

  const displayed = expanded ? timeline : timeline.slice(0, 7)

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Route Timeline & Halts
      </h3>

      <div className="relative">
        {displayed.map((stop, idx) => {
          const isCompleted = stop.complete
          const isCurrent = stop.status === 'Current'
          const isLast = idx === displayed.length - 1

          return (
            <div key={idx} className="flex items-start gap-4 relative">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={`absolute left-[11px] top-7 w-0.5 h-[calc(100%-8px)] ${
                    isCompleted ? 'bg-emerald-500/60' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Status dot */}
              <div className="relative z-10 shrink-0 mt-0.5">
                {isCompleted && !isCurrent ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : isCurrent ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-emerald-200 flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                ) : (
                  <Circle className="w-6 h-6 text-slate-300" />
                )}
              </div>

              {/* Station info */}
              <div
                className={`flex-1 pb-5 min-w-0 ${
                  isCurrent
                    ? 'bg-emerald-50/70 -mx-2 px-3 py-2 rounded-xl border border-emerald-200'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-emerald-800'
                          : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-500'
                      }`}
                    >
                      {stop.station}
                    </span>
                    {stop.stationCode && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {stop.stationCode}
                      </span>
                    )}
                    {(stop.type === 'Source' || stop.type === 'Destination') && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300">
                        {stop.type}
                      </span>
                    )}
                  </div>

                  {stop.delay && stop.delay !== 'On Time' && stop.delay !== '—' && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        stop.delay.includes('+')
                          ? 'text-amber-700 bg-amber-50 border-amber-200'
                          : stop.delay.includes('Recover')
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-slate-600 bg-slate-100 border-slate-200'
                      }`}
                    >
                      {stop.delay}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {stop.time}
                  </span>
                  {stop.platform && <span className="text-slate-600 font-semibold">{stop.platform}</span>}
                  {stop.status && stop.status !== 'Current' && (
                    <span className="text-slate-500 italic text-[11px] font-medium">{stop.status}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
