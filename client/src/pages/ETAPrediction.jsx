import { useTrain } from '../context/TrainContext.jsx'
import { useETAPrediction } from '../hooks/useETAPrediction.js'
import { ETAPredictionCard } from '../components/eta/ETAPredictionCard.jsx'
import { PredictionFactors } from '../components/eta/PredictionFactors.jsx'
import { ConfidenceScore } from '../components/eta/ConfidenceScore.jsx'
import { ETAHistoryChart } from '../components/eta/ETAHistoryChart.jsx'
import { Loader } from '../components/common/Loader.jsx'
import { Sparkles } from 'lucide-react'

const ETAPrediction = () => {
  const { selectedTrainNumber } = useTrain()
  const { prediction, history, loading } = useETAPrediction(selectedTrainNumber)

  if (loading) {
    return <Loader message="Computing AI-powered ETA prediction..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">ETA Prediction Engine</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Multi-factor AI arrival forecasting with confidence calibration
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5" /> AI Engine Active
        </div>
      </div>

      <ETAPredictionCard prediction={prediction} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PredictionFactors factors={prediction?.factors} />
          <ETAHistoryChart history={history} />
        </div>

        <div>
          <ConfidenceScore
            confidence={prediction?.confidence || 85}
            label={prediction?.confidenceLabel || 'High confidence'}
          />
        </div>
      </div>
    </div>
  )
}

export default ETAPrediction
