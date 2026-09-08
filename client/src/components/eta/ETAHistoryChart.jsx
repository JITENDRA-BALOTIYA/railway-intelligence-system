import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null
  return (
    <div className="bg-white rounded-xl p-3 text-xs border border-slate-200 shadow-lg">
      <p className="font-bold text-slate-900 mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="flex items-center gap-2 font-medium" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: <span className="font-mono font-bold">{entry.value} min</span>
        </p>
      ))}
    </div>
  )
}

export const ETAHistoryChart = ({ history = [] }) => {
  if (!history || history.length === 0) return null

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Prediction Accuracy Timeline
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 10 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: '#475569' }}
            />
            <Line
              type="monotone"
              dataKey="scheduled"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              name="Scheduled"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#059669"
              strokeWidth={2.5}
              dot={{ fill: '#059669', r: 3 }}
              name="AI Predicted"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#0284c7"
              strokeWidth={2}
              dot={{ fill: '#0284c7', r: 3 }}
              name="Actual"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
