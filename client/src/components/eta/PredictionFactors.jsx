export const PredictionFactors = ({ factors = [] }) => {
  if (!factors || factors.length === 0) return null

  const getBarColor = (impact) => {
    if (impact < 0) return 'bg-emerald-500'
    if (impact > 60) return 'bg-rose-500'
    if (impact > 35) return 'bg-amber-500'
    return 'bg-blue-500'
  }

  const getLevelBadge = (level) => {
    const lower = (level || '').toLowerCase()
    if (lower.includes('critical') || lower.includes('high'))
      return 'bg-rose-50 text-rose-700 border-rose-200'
    if (lower.includes('moderate'))
      return 'bg-amber-50 text-amber-700 border-amber-200'
    if (lower.includes('favorable') || lower.includes('recovery'))
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Delay Attribution Factors
      </h3>

      <div className="space-y-3.5">
        {factors.map((factor, idx) => {
          const absImpact = Math.abs(factor.impact)
          const barWidth = Math.min(absImpact, 100)

          return (
            <div key={idx}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800">{factor.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelBadge(
                    factor.level,
                  )}`}
                >
                  {factor.level}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${getBarColor(factor.impact)} transition-all duration-700`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
