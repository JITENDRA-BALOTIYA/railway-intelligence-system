import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export const RoutePerformanceChart = ({ corridors = [] }) => {
  if (!corridors || corridors.length === 0) return null

  const data = corridors.map((c) => ({
    name: c.corridor?.split('(')[0]?.trim() || c.name || 'Corridor',
    delay: c.avgDelay || 0,
    congestion: c.congestionIndex || 0,
  }))

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Corridor Average Delay (Minutes)
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#64748b' }}
              angle={-20}
              textAnchor="end"
            />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="delay" fill="#059669" radius={[4, 4, 0, 0]} name="Avg Delay (min)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
