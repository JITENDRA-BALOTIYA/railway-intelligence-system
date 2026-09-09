import { useState, useEffect } from 'react'
import { useTrain } from '../context/TrainContext.jsx'
import { delayService } from '../services/delayService.js'
import { Card } from '../components/common/Card.jsx'
import { Badge } from '../components/common/Badge.jsx'
import { Loader } from '../components/common/Loader.jsx'
import { Gauge, Clock, TrendingUp, AlertTriangle, Navigation, Search } from 'lucide-react'

const FutureDelayRisk = () => {
  const { selectedTrainNumber, selectedTrain, searchTrain } = useTrain()
  const [riskData, setRiskData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [localInput, setLocalInput] = useState('')

  useEffect(() => {
    const loadRisk = async () => {
      if (!selectedTrainNumber) {
        setRiskData(null)
        return
      }
      try {
        setLoading(true)
        const data = await delayService.getDelayReasons(selectedTrainNumber)
        setRiskData(data)
      } catch (e) {
        console.error('Failed to load risk data:', e)
        setRiskData(null)
      } finally {
        setLoading(false)
      }
    }
    loadRisk()
  }, [selectedTrainNumber])

  const handleSearch = (e) => {
    e.preventDefault()
    if (localInput.trim()) {
      searchTrain(localInput.trim())
    }
  }

  if (loading && selectedTrainNumber) {
    return <Loader message={`Forecasting forward delay propagation for train #${selectedTrainNumber}...`} />
  }

  const riskColorMap = {
    Low: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Moderate: 'text-amber-700 bg-amber-50 border-amber-200',
    High: 'text-rose-700 bg-rose-50 border-rose-200',
    Severe: 'text-rose-700 bg-rose-50 border-rose-200',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Future Delay Risk Forecast</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Forward delay propagation and corridor bottleneck risk {selectedTrainNumber ? `for Train #${selectedTrainNumber}` : ''}
        </p>
      </div>

      {riskData ? (
        <>
          {/* Current State */}
          <Card glow>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                <Gauge className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    #{riskData.trainNumber}
                  </span>
                  <div className="text-base font-bold text-slate-900">{riskData.primaryReason}</div>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Current Delay: <span className="text-slate-900 font-bold font-mono">{riskData.durationMinutes} min</span>
                  {' • '}Recovery Probability: <span className="text-emerald-700 font-bold font-mono">{riskData.recoveryProbability}%</span>
                </div>
              </div>
              <Badge variant={riskData.riskLevel === 'Severe' || riskData.riskLevel === 'High' ? 'red' : 'orange'} size="lg">
                {riskData.riskLevel} Risk
              </Badge>
            </div>
          </Card>

          {/* Forward Risk Timeline */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Forward Delay Propagation Forecast
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(riskData.forwardRisks || []).map((risk, idx) => (
                <Card key={idx} hover>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {risk.horizon}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskColorMap[risk.riskLevel] || riskColorMap.Low}`}>
                      {risk.riskLevel}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold font-mono text-slate-900">{risk.expectedDrift}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">Expected delay drift</div>
                </Card>
              ))}
            </div>
          </div>

          {/* Contributing Delay Breakdown */}
          <Card>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Contributing Delay Components
            </h3>
            <div className="space-y-3">
              {(riskData.breakdown || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-xs font-bold text-slate-800">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900 w-16 text-right">{item.value} min</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        /* Empty State Prompt */
        <div className="bg-white rounded-2xl p-10 border border-slate-200/90 shadow-xs text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-xs">
            <Navigation className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No train selected for risk forecasting
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1 max-w-md mx-auto leading-relaxed">
            Search for a train number to project corridor bottlenecks and forward cascading delay risks.
          </p>

          <form onSubmit={handleSearch} className="max-w-md mx-auto mt-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                placeholder="Enter train number (e.g. 12301)..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              Forecast Risk
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Try:</span>
            {['12301', '12951', '12002', '22221'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => searchTrain(num)}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                #{num}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FutureDelayRisk
