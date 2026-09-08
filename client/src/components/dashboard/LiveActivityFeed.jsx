import { TrainFront, ArrowRight, Gauge, Radio } from 'lucide-react'
import { Badge } from '../common/Badge.jsx'
import { useTrain } from '../../context/TrainContext.jsx'

export const LiveActivityFeed = ({ trains = [] }) => {
  const { setSelectedTrainNumber, selectedTrainNumber } = useTrain()

  const displayedTrains = trains.slice(0, 6)

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Network Telemetry
        </h3>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
          <Radio className="w-2.5 h-2.5" /> Real-time
        </span>
      </div>

      <div className="space-y-2.5">
        {displayedTrains.map((train) => {
          const isSelected = selectedTrainNumber === train.trainNumber
          const isDelayed = train.delay > 0

          return (
            <button
              key={train.trainNumber}
              onClick={() => setSelectedTrainNumber(train.trainNumber)}
              className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-emerald-50/50 border-emerald-400 shadow-xs'
                  : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                  <TrainFront className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{train.trainName}</div>
                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <span className="font-mono">#{train.trainNumber}</span>
                    <span>•</span>
                    <span>{train.sourceCode || 'SRC'}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                    <span>{train.destinationCode || 'DEST'}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-bold font-mono text-slate-800">{train.speed} km/h</div>
                <Badge variant={isDelayed ? 'red' : 'green'} size="sm" className="mt-0.5">
                  {isDelayed ? `+${train.delay}m` : 'On Time'}
                </Badge>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
