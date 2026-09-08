import { Cloud, Eye, Thermometer, Wind } from 'lucide-react'

export const WeatherWidget = ({ weather }) => {
  if (!weather) return null

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Weather Conditions
      </h3>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <Cloud className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">{weather.condition || 'Clear Sky'}</div>
          <div className="text-xs text-slate-500 font-medium">{weather.temp || '26°C'}</div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-slate-500 font-medium">
            <Thermometer className="w-3.5 h-3.5 text-slate-400" /> Temperature
          </span>
          <span className="font-bold text-slate-900">{weather.temp || '26°C'}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-slate-500 font-medium">
            <Eye className="w-3.5 h-3.5 text-slate-400" /> Visibility
          </span>
          <span className="font-bold text-emerald-700">{weather.visibility || '1000 m'}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-slate-500 font-medium">
            <Wind className="w-3.5 h-3.5 text-slate-400" /> Impact
          </span>
          <span className="font-bold text-slate-700">Minimal / Nominal</span>
        </div>
      </div>
    </div>
  )
}
