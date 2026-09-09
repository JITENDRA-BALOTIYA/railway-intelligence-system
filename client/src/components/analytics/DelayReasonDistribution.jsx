import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload[0]) return null
  return (
    <div className="bg-white rounded-xl p-3 text-xs border border-slate-200 shadow-lg">
      <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: payload[0].payload.color }}
        />
        <span>{payload[0].payload.name}</span>
      </p>
      <p className="text-slate-600 font-mono font-semibold pl-4">
        {payload[0].value}% contribution
      </p>
    </div>
  )
}

export const DelayReasonDistribution = ({ reasons = [] }) => {
  if (!reasons.length) return null

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Delay Root Cause Distribution
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={reasons}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {reasons.map((entry, index) => (
                <Cell key={index} fill={entry.color || '#059669'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-xs text-slate-700 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
