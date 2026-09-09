import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrain } from '../context/TrainContext.jsx'
import { TrainTrackingCard } from '../components/tracking/TrainTrackingCard.jsx'
import { RouteTimeline } from '../components/tracking/RouteTimeline.jsx'
import { SpeedGauge } from '../components/tracking/SpeedGauge.jsx'
import { WeatherWidget } from '../components/tracking/WeatherWidget.jsx'
import { Loader } from '../components/common/Loader.jsx'
import { Radio, Search, Navigation, RefreshCw } from 'lucide-react'

const LiveTracking = () => {
  const { selectedTrainNumber, selectedTrain, searchTrain, refreshTrain, loading, isRefreshing } = useTrain()
  const [localInput, setLocalInput] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (localInput.trim()) {
      searchTrain(localInput.trim())
    }
  }

  if (loading && !selectedTrain) {
    return <Loader message="Acquiring real-time train telemetry from RailRadar..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Live Train Tracking</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time satellite GPS position, speed gauge, and halt timeline
          </p>
        </div>
        {selectedTrain && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{selectedTrain.dataSource === 'RAILRADAR' ? 'RailRadar Live Feed' : 'Cached Feed'}</span>
            </div>
            <button
              type="button"
              onClick={refreshTrain}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 bg-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        )}
      </div>

      {selectedTrain ? (
        <>
          <TrainTrackingCard train={selectedTrain} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {selectedTrain.timeline && selectedTrain.timeline.length > 0 && (
                <RouteTimeline timeline={selectedTrain.timeline} expanded={true} />
              )}
            </div>

            <div className="space-y-6">
              <SpeedGauge speed={selectedTrain.speed || 0} />
              <WeatherWidget weather={selectedTrain.weather} />
            </div>
          </div>
        </>
      ) : (
        /* Empty State Prompt */
        <div className="bg-white rounded-2xl p-10 border border-slate-200/90 shadow-xs text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-xs">
            <Navigation className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No train selected for live tracking
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1 max-w-md mx-auto leading-relaxed">
            Enter a train number to stream its live satellite telemetry, velocity gauge, and route progress.
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
              Track Live
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

export default LiveTracking
