import { TrainFront, Gauge, MapPin, ArrowRight, Radio } from 'lucide-react'
import { Badge } from '../common/Badge.jsx'

export const TrainTrackingCard = ({ train }) => {
  if (!train) return null

  const delayTone = train.delay > 30 ? 'red' : train.delay > 10 ? 'orange' : 'green'

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs relative overflow-hidden">
      {/* Train Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <TrainFront className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                #{train.trainNumber}
              </span>
              <span className="text-xs font-semibold text-slate-500">• {train.type || 'Superfast'}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{train.trainName}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
              <span>{train.source || 'Origin'}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span>{train.destination || 'Destination'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={delayTone} size="md">
            {train.status}
            {train.delay > 0 ? ` (+${train.delay} min)` : ''}
          </Badge>
          <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" /> LIVE
          </span>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <Gauge className="w-4 h-4 text-emerald-600 mx-auto" />
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{train.speed}</div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase">km/h Velocity</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <MapPin className="w-4 h-4 text-emerald-600 mx-auto" />
          <div className="text-xs font-bold text-slate-900 mt-1 truncate">
            {(train.currentStation || '').replace(/\(.*\)/, '').trim() || 'En Route'}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Current Station</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <ArrowRight className="w-4 h-4 text-emerald-600 mx-auto" />
          <div className="text-xs font-bold text-slate-900 mt-1 truncate">
            {(train.nextStation || '').replace(/\(.*\)/, '').trim() || 'Terminus'}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Next Halt</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <span className="text-sm font-bold text-emerald-700">{train.platform || 'PF 1'}</span>
          <div className="text-[10px] text-slate-500 font-semibold uppercase mt-1">Platform</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
          <span>Journey Progress</span>
          <span className="font-mono text-emerald-700">{train.progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
            style={{ width: `${train.progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1.5">
          <span>{train.sourceCode || 'SRC'}</span>
          <span>{train.distanceRemainingKm ? `${train.distanceRemainingKm} km remaining` : ''}</span>
          <span>{train.destinationCode || 'DEST'}</span>
        </div>
      </div>
    </div>
  )
}
