import { Clock, TrendingUp, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react'
import { Badge } from '../common/Badge.jsx'

export const ETAPredictionCard = ({ prediction }) => {
  if (!prediction) return null

  const isDelayed = prediction.delayDelta > 0
  const confidenceColor =
    prediction.confidence >= 85 ? 'text-emerald-700' : prediction.confidence >= 70 ? 'text-amber-700' : 'text-rose-700'

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              #{prediction.trainNumber}
            </span>
            <span className="text-xs font-semibold text-slate-500">• AI Forecast Model</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">{prediction.trainName}</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Destination: {prediction.destination}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isDelayed ? 'orange' : 'green'} size="lg">
            {isDelayed ? `+${prediction.delayDelta} min Projected Delay` : 'On Schedule'}
          </Badge>
        </div>
      </div>

      {/* Main Prediction Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <span className="text-xs font-bold text-slate-500 uppercase">Scheduled Arrival</span>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
            {prediction.scheduledArrival}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Timetable baseline</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-300 text-center shadow-xs">
          <span className="text-xs font-bold text-emerald-800 uppercase flex items-center justify-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> AI Predicted Arrival
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-800 mt-1">
            {prediction.predictedArrival}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">
            {prediction.predictedDelayMinutes > 0 ? `+${prediction.predictedDelayMinutes} min expected` : 'Optimal corridor speed'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <span className="text-xs font-bold text-slate-500 uppercase">Confidence Score</span>
          <div className={`text-2xl font-extrabold font-mono mt-1 ${confidenceColor}`}>
            {prediction.confidence}%
          </div>
          <span className="text-[10px] text-slate-500 font-medium">{prediction.confidenceLabel}</span>
        </div>
      </div>

      {/* Summary Note */}
      {prediction.summary && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5 text-xs text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{prediction.summary}</p>
        </div>
      )}
    </div>
  )
}
