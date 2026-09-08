import { Card } from './Card.jsx'
import { TrendingUp, TrendingDown } from 'lucide-react'

export const StatWidget = ({
  title,
  value,
  unit,
  change,
  trend = 'up',
  icon: Icon,
  description,
  colorTone = 'emerald',
}) => {
  const toneBg = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  }

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{value}</span>
            {unit && <span className="text-xs text-slate-500 font-medium">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${toneBg[colorTone] || toneBg.emerald}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change || description) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          {change && (
            <span
              className={`flex items-center gap-0.5 font-bold ${
                trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {description && <span className="text-slate-500 truncate">{description}</span>}
        </div>
      )}
    </Card>
  )
}
