export const SpeedGauge = ({ speed = 0, maxSpeed = 160 }) => {
  const percentage = Math.min((speed / maxSpeed) * 100, 100)
  const angle = -135 + (percentage / 100) * 270
  const r = 56
  const cx = 64
  const cy = 64

  const startAngle = -135
  const endAngle = 135
  const totalAngle = endAngle - startAngle

  const polarToCartesian = (angleDeg) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const bgStart = polarToCartesian(startAngle)
  const bgEnd = polarToCartesian(endAngle)
  const valueEnd = polarToCartesian(startAngle + (percentage / 100) * totalAngle)
  const largeArcBg = totalAngle > 180 ? 1 : 0
  const filledAngle = (percentage / 100) * totalAngle
  const largeArcValue = filledAngle > 180 ? 1 : 0

  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArcBg} 1 ${bgEnd.x} ${bgEnd.y}`
  const valuePath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArcValue} 1 ${valueEnd.x} ${valueEnd.y}`

  const speedColor =
    speed > 110 ? '#059669' : speed > 70 ? '#0284c7' : speed > 40 ? '#d97706' : '#64748b'

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col items-center">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        Velocity Monitor
      </h3>

      <div className="relative w-36 h-36">
        <svg viewBox="0 0 128 128" className="w-full h-full">
          {/* Background arc */}
          <path d={bgPath} fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />

          {/* Value arc */}
          {percentage > 0 && (
            <path
              d={valuePath}
              fill="none"
              stroke={speedColor}
              strokeWidth="10"
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          )}

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const tickAngle = startAngle + (pct / 100) * totalAngle
            const outer = polarToCartesian(tickAngle)
            const inner = {
              x: cx + (r - 14) * Math.cos(((tickAngle - 90) * Math.PI) / 180),
              y: cy + (r - 14) * Math.sin(((tickAngle - 90) * Math.PI) / 180),
            }
            return (
              <line
                key={pct}
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
            )
          })}
        </svg>

        {/* Center display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
          <span className="text-3xl font-extrabold font-mono text-slate-900">{speed}</span>
          <span className="text-[10px] text-slate-500 font-bold -mt-0.5">KM/H</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-1 text-[11px]">
        <span className="text-slate-400 font-medium">Max: {maxSpeed} km/h</span>
        <span className="font-bold text-emerald-700">
          {speed > 100 ? 'High Speed' : speed > 60 ? 'Normal Zone' : speed > 0 ? 'Slow Zone' : 'Stationary'}
        </span>
      </div>
    </div>
  )
}
