import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      <p className="text-rose-600 font-mono font-bold">Delay: +{payload[0]?.value} min</p>
    </div>
  )
}

export const DelayTrendChart = ({ data = [], period = 'Last 24 Hours' }) => {
  const peak = data.reduce((m, d) => (d.delay > m.delay ? d : m), { delay: 0, time: '' })
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">📈</span>
          <span className="text-sm font-bold text-slate-800">Delay Trend</span>
          <span className="text-[11px] text-slate-400">({period})</span>
        </div>
        <select className="text-[11px] font-mono text-slate-600 border border-slate-200 rounded-lg px-2 py-0.5 bg-white focus:outline-none cursor-pointer">
          <option>Last 24 Hours</option>
          <option>Last 7 Days</option>
          <option>This Month</option>
        </select>
      </div>

      {/* Peak annotation */}
      {peak.delay > 0 && (
        <div className="mb-2 flex items-center gap-2 text-[11px] text-rose-600 font-mono font-bold">
          <span>+{peak.delay} min</span>
          <span className="text-slate-400 font-normal">peak at {peak.time}</span>
        </div>
      )}

      <div className="flex-1 min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="delayGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#e2e8f0" />
            <Area
              type="monotone"
              dataKey="delay"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#delayGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#ef4444' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
