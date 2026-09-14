import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-xs space-y-1">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-800">{p.value ? `${Math.floor(p.value / 60)}:${String(p.value % 60).padStart(2,'0')}` : '—'}</span>
        </p>
      ))}
    </div>
  )
}

export const PredictedVsActualChart = ({ data = [] }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">📊</span>
        <span className="text-sm font-bold text-slate-800">Predicted vs Actual ETA</span>
      </div>

      <div className="flex-1 min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="station"
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${Math.floor(v / 60)}h`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 10, color: '#475569' }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual ETA"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 3, fill: '#0ea5e9' }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              name="Predicted ETA"
              stroke="#059669"
              strokeWidth={2}
              dot={{ r: 3, fill: '#059669' }}
            />
            <Line
              type="monotone"
              dataKey="scheduled"
              name="Scheduled ETA"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
