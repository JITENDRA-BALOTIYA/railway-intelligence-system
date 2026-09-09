import { TrainFront, ArrowRight, Gauge, Radio, Search } from 'lucide-react'
import { Badge } from '../common/Badge.jsx'
import { useTrain } from '../../context/TrainContext.jsx'
import { useNavigate } from 'react-router-dom'

export const LiveActivityFeed = () => {
  const { selectedTrain, recentSearches, searchTrain } = useTrain()
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Tracked Trains & History
        </h3>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
          <Radio className="w-2.5 h-2.5" /> RailRadar
        </span>
      </div>

      {selectedTrain ? (
        <div className="space-y-3">
          {/* Active Train Card */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-300 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <TrainFront className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {selectedTrain.trainName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    #{selectedTrain.trainNumber} • {selectedTrain.sourceCode || 'SRC'} → {selectedTrain.destinationCode || 'DEST'}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-mono font-bold text-slate-900">{selectedTrain.speed} km/h</div>
                <Badge variant={selectedTrain.delay > 0 ? 'red' : 'green'} size="sm">
                  {selectedTrain.delay > 0 ? `+${selectedTrain.delay}m` : 'On Time'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Other recent searches */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-600 mb-2">Recent Searches:</div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => navigate(`/search?train=${num}`)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-bold font-mono transition-colors cursor-pointer"
                >
                  #{num}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <TrainFront className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">No train currently selected.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {recentSearches.slice(0, 4).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => navigate(`/search?train=${num}`)}
                className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 text-[11px] font-mono font-bold transition-colors cursor-pointer"
              >
                Track #{num}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
