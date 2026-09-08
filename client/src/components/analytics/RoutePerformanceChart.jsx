import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null
  return (
    <div className="bg-white rounded-xl p-3 text-xs border border-slate-200 shadow-lg">
      <p className="font-bold text-slate-900 mb-1">{label}</p>
      <p className="text-slate-600">Congestion Index: <span className="font-mono font-bold text-emerald-600">{payload[0]?.value}</span></p>
      <p className="text-slate-500">Avg Delay: {payload[0]?.payload?.avgDelay} min</p>
    </div>
  )
}

export const RoutePerformanceChart = ({ corridors = [] }) => {
  if (!corridors.length) return null

  const getBarColor = (index) => {
    if (index > 80) return '#e11d48'
    if (index > 60) return '#d97706'
    return '#059669'
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Corridor Congestion Index
      </h3>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={corridors} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
            <YAxis
              type="category"
              dataKey="corridor"
              tick={{ fill: '#334155', fontSize: 10, fontWeight: 500 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              width={160}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="congestionIndex" radius={[0, 6, 6, 0]} barSize={18}>
              {corridors.map((entry, idx) => (
                <Cell key={idx} fill={getBarColor(entry.congestionIndex)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
