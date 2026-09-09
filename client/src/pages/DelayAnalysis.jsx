import { useState, useEffect } from 'react'
import { useTrain } from '../context/TrainContext.jsx'
import { delayService } from '../services/delayService.js'
import { Card } from '../components/common/Card.jsx'
import { Badge } from '../components/common/Badge.jsx'
import { Loader } from '../components/common/Loader.jsx'
import { AlertTriangle, Clock, ShieldAlert, Navigation, Search } from 'lucide-react'

const DelayAnalysis = () => {
  const { selectedTrainNumber, selectedTrain, searchTrain } = useTrain()
  const [delayData, setDelayData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [localInput, setLocalInput] = useState('')

  useEffect(() => {
    const loadDelay = async () => {
      if (!selectedTrainNumber) {
        setDelayData(null)
        return
      }
      try {
        setLoading(true)
        const data = await delayService.getDelay(selectedTrainNumber)
        setDelayData(data)
      } catch (e) {
        console.error('Failed to load delay data:', e)
        setDelayData(null)
      } finally {
        setLoading(false)
      }
    }
    loadDelay()
  }, [selectedTrainNumber])

  const handleSearch = (e) => {
    e.preventDefault()
    if (localInput.trim()) {
      searchTrain(localInput.trim())
    }
  }

  if (loading && selectedTrainNumber) {
    return <Loader message={`Decomposing delay components for train #${selectedTrainNumber}...`} />
  }

  const toneMap = { Minor: 'green', Moderate: 'orange', High: 'red', Critical: 'red', Low: 'green' }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Delay Root Cause Analysis</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Decomposing delay factors and recovery windows {selectedTrainNumber ? `for Train #${selectedTrainNumber}` : ''}
        </p>
      </div>

      {delayData ? (
        <>
          {/* Primary Cause Banner */}
          <Card glow>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      #{delayData.trainNumber}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">{delayData.reason}</h2>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                    <span>Current Delay: <span className="font-mono font-bold text-slate-900">{delayData.duration} min</span></span>
                    <span>Recovery: <span className="font-mono font-bold text-emerald-700">{delayData.recoveryProbability}%</span></span>
                  </div>
                </div>
              </div>
              <Badge variant={toneMap[delayData.impact] || 'orange'} size="lg">
                {delayData.impact} Impact
              </Badge>
            </div>

            {delayData.notes && (
              <p className="text-xs text-slate-600 mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 leading-relaxed">
                <span className="text-slate-900 font-bold">Control Advisory:</span> {delayData.notes}
              </p>
            )}
          </Card>

          {/* Breakdown Chart */}
          <Card>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Delay Attribution Breakdown
            </h3>
            <div className="space-y-3.5">
              {(delayData.breakdown || []).map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-800 font-bold">{item.label}</span>
                    <span className="font-mono font-bold text-slate-700">{item.value} min ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-700"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recovery & Risk */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Risk Level</div>
              <div className={`text-2xl font-extrabold mt-1 ${
                delayData.riskLevel === 'Severe' ? 'text-rose-600' :
                delayData.riskLevel === 'High' ? 'text-amber-600' : 'text-emerald-700'
              }`}>
                {delayData.riskLevel}
              </div>
            </Card>
            <Card>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Recovery Probability</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">{delayData.recoveryProbability}%</div>
            </Card>
            <Card>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Recovery Window</div>
              <div className="text-sm font-bold text-slate-800 mt-1">{delayData.recoveryWindow}</div>
            </Card>
          </div>
        </>
      ) : (
        /* Empty State Prompt */
        <div className="bg-white rounded-2xl p-10 border border-slate-200/90 shadow-xs text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-xs">
            <Navigation className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No train selected for delay analysis
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1 max-w-md mx-auto leading-relaxed">
            Search for a train to analyze delay attribution, section interlocking bottlenecks, and recovery probability.
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
              Analyze Delay
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

export default DelayAnalysis
