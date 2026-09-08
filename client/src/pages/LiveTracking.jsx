import { useTrain } from '../context/TrainContext.jsx'
import { useTrainTracking } from '../hooks/useTrainTracking.js'
import { TrainTrackingCard } from '../components/tracking/TrainTrackingCard.jsx'
import { RouteTimeline } from '../components/tracking/RouteTimeline.jsx'
import { SpeedGauge } from '../components/tracking/SpeedGauge.jsx'
import { WeatherWidget } from '../components/tracking/WeatherWidget.jsx'
import { Loader } from '../components/common/Loader.jsx'
import { Radio } from 'lucide-react'

const LiveTracking = () => {
  const { selectedTrainNumber, selectedTrain } = useTrain()
  const { data: liveData, loading } = useTrainTracking(selectedTrainNumber)

  const displayTrain = liveData || selectedTrain

  if (loading && !displayTrain) {
    return <Loader message="Acquiring real-time train telemetry..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Live Train Tracking</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time position, speed, and route progress monitoring
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Telemetry Feed
        </div>
      </div>

      {displayTrain && <TrainTrackingCard train={displayTrain} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {displayTrain?.timeline && (
            <RouteTimeline timeline={displayTrain.timeline} expanded={true} />
          )}
        </div>

        <div className="space-y-6">
          <SpeedGauge speed={displayTrain?.speed || 0} />
          <WeatherWidget weather={displayTrain?.weather} />
        </div>
      </div>
    </div>
  )
}

export default LiveTracking
