import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertTriangle, Lightbulb, Info, CheckCircle, Bot } from 'lucide-react'

const INSIGHT_CONFIG = {
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-500' },
  suggestion: { icon: Lightbulb, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconColor: 'text-blue-500' },
  info: { icon: Info, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', iconColor: 'text-slate-500' },
  success: { icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-500' },
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-800">{d.cause}</p>
      <p className="text-slate-500 font-mono">{d.percent}%</p>
    </div>
  )
}

export const DelayCausesDonut = ({ causes = [], insights = [], currentDelay = 0 }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col gap-4">
      {/* Donut chart row */}
      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={causes}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                dataKey="percent"
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {causes.map((c, i) => (
                  <Cell key={i} fill={c.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-800 font-mono leading-none">
              +{currentDelay}m
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">Current Delay</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5">
          {causes.map((c, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: c.color }} />
                <span className="text-[11px] text-slate-600 truncate">{c.cause}</span>
              </div>
              <span className="text-[11px] font-bold font-mono text-slate-800 shrink-0">{c.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Bot className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-bold text-slate-800">AI Insights & Recommendations</span>
        </div>
        <div className="space-y-2">
          {insights.map((ins, i) => {
            const cfg = INSIGHT_CONFIG[ins.type] || INSIGHT_CONFIG.info
            const Icon = cfg.icon
            return (
              <div
                key={i}
                className={`flex items-start gap-2 p-2 rounded-xl border text-[11px] leading-snug ${cfg.bg} ${cfg.border} ${cfg.text}`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${cfg.iconColor}`} />
                <span>{ins.text}</span>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          className="mt-3 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          View Detailed Analysis →
        </button>
      </div>
    </div>
  )
}
