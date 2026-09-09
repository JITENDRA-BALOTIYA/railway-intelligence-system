import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTrain } from '../context/TrainContext.jsx'
import { TrainDetailPanel } from '../components/tracking/TrainDetailPanel.jsx'
import { Loader } from '../components/common/Loader.jsx'
import { Badge } from '../components/common/Badge.jsx'
import {
  Search,
  TrainFront,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Gauge,
  Radio,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Circle,
  History,
  Navigation,
} from 'lucide-react'

const TrainSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const trainQueryParam = searchParams.get('train') || ''

  const {
    selectedTrain,
    selectedTrainNumber,
    searchTrain,
    refreshTrain,
    loading,
    isRefreshing,
    error,
    recentSearches,
    clearSelectedTrain,
  } = useTrain()

  const [inputNumber, setInputNumber] = useState(trainQueryParam)

  // Synchronize with URL query parameter ?train=12301
  useEffect(() => {
    if (trainQueryParam && trainQueryParam !== selectedTrainNumber) {
      setInputNumber(trainQueryParam)
      searchTrain(trainQueryParam)
    }
  }, [trainQueryParam])

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    const clean = inputNumber.trim()
    if (clean) {
      setSearchParams({ train: clean })
      searchTrain(clean)
    }
  }

  const handleShortcutClick = (trainNum) => {
    setInputNumber(trainNum)
    setSearchParams({ train: trainNum })
    searchTrain(trainNum)
  }

  const handleClear = () => {
    setInputNumber('')
    setSearchParams({})
    clearSelectedTrain()
  }

  const delayTone = (selectedTrain?.delay || 0) > 20 ? 'red' : (selectedTrain?.delay || 0) > 5 ? 'orange' : 'green'

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="hero-gradient-bg rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Indian Railways Live Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Live Train Search & GPS Route Telemetry
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
            Directly connected to RailRadar real-time satellite feeds. Search any train number for instant live status, delay analysis, and complete stop timelines.
          </p>
        </div>

        {/* Live Status indicator on Hero */}
        <div className="relative shrink-0">
          <div className="px-5 py-4 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-200/80 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>RailRadar API Active</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 font-mono">Real-Time Precision Data</span>
          </div>
        </div>
      </div>

      {/* 2. Main Search Input Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              placeholder="Enter train number (e.g. 12301, 12951, 12002)..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !inputNumber.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer shrink-0 active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Fetching Live Data...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search Train</span>
              </>
            )}
          </button>
        </form>

        {/* Recent Search Shortcut Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-bold text-slate-600 flex items-center gap-1">
            <History className="w-3.5 h-3.5 text-emerald-600" />
            Quick Searches:
          </span>
          {recentSearches.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleShortcutClick(num)}
              className="px-3 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-bold font-mono transition-colors cursor-pointer"
            >
              {num}
            </button>
          ))}
          {selectedTrain && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-auto text-[11px] font-medium text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* 3. Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4 animate-bounce">
            <TrainFront className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Fetching live railway data from RailRadar...</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Retrieving real-time GPS coordinates, station schedule, and delay metrics for train #{inputNumber}
          </p>
        </div>
      )}

      {/* 4. Error / Not Found State */}
      {!loading && error && (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Train not found</h3>
          <p className="text-xs text-slate-600 font-medium mt-1 max-w-md mx-auto">
            {error}
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="text-xs text-slate-500">Try popular trains:</span>
            {['12301', '12951', '12002', '22221'].map((t) => (
              <button
                key={t}
                onClick={() => handleShortcutClick(t)}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono hover:bg-emerald-100 cursor-pointer"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Initial Empty State (When no search has been initiated yet) */}
      {!loading && !error && !selectedTrain && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 md:p-12 shadow-xs">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-xs">
              <Navigation className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Search Indian Railways
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
              Enter any 5-digit Indian Railway train number above to unlock real-time telemetry:
            </p>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mt-6 bg-slate-50/70 p-5 rounded-xl border border-slate-200/80">
              {[
                'Live train running status & speed',
                'Complete route & halt timeline',
                'Current location & next station',
                'Real-time delay & recovery drift',
                'Expected arrival & departure timings',
                'Platform numbers & distance progress',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Quick action buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-bold text-slate-600">Sample Trains:</span>
              {[
                { num: '12301', name: 'Howrah Rajdhani' },
                { num: '12951', name: 'Mumbai Rajdhani' },
                { num: '12002', name: 'Bhopal Shatabdi' },
                { num: '22221', name: 'CSMT Vande Bharat' },
              ].map((item) => (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => handleShortcutClick(item.num)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 hover:text-emerald-700 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <span className="font-mono font-bold text-emerald-700 mr-1.5">{item.num}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Active Train Details View (Strictly for the searched train) */}
      {!loading && selectedTrain && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Train Header, Telemetry, and Full Route Table */}
          <div className="xl:col-span-8 space-y-6">
            {/* Live Train Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs relative overflow-hidden">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <TrainFront className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        #{selectedTrain.trainNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">• {selectedTrain.type || 'Superfast Express'}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                      {selectedTrain.trainName}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
                      <span>{selectedTrain.source || `${selectedTrain.sourceName} (${selectedTrain.sourceCode})`}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedTrain.destination || `${selectedTrain.destName} (${selectedTrain.destinationCode})`}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={delayTone} size="md">
                    {selectedTrain.status}
                    {(selectedTrain.delay || 0) > 0 ? ` (+${selectedTrain.delay} min)` : ''}
                  </Badge>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                    <span>{selectedTrain.dataSource === 'RAILRADAR' ? '● LIVE • RailRadar' : 'CACHED'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={refreshTrain}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 text-xs font-bold transition-all cursor-pointer"
                    title="Refresh Live Telemetry"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Telemetry 4-Pack */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-5">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <Gauge className="w-4 h-4 text-emerald-600 mx-auto" />
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                    {selectedTrain.speed ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">km/h Speed</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <MapPin className="w-4 h-4 text-emerald-600 mx-auto" />
                  <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                    {selectedTrain.currentStationName || selectedTrain.currentStation || 'En Route'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Current Station</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <ArrowRight className="w-4 h-4 text-emerald-600 mx-auto" />
                  <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                    {selectedTrain.nextStation || selectedTrain.destName || 'Terminus'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Next Halt</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <span className="text-sm font-bold text-emerald-700">{selectedTrain.platform || 'Platform: —'}</span>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase mt-1">Platform</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Journey Progress</span>
                  <span className="font-mono text-emerald-700">{selectedTrain.progress || 0}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: `${selectedTrain.progress || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium mt-1.5">
                  <span>{selectedTrain.sourceCode || 'SRC'}</span>
                  <span>{selectedTrain.distanceRemainingKm ? `${selectedTrain.distanceRemainingKm} km remaining` : ''}</span>
                  <span>{selectedTrain.destinationCode || 'DEST'}</span>
                </div>
              </div>
            </div>

            {/* Complete Route & Halt Station Timeline Table */}
            {selectedTrain.timeline && selectedTrain.timeline.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Complete Route Schedule ({selectedTrain.timeline.length} Halts)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Real-time arrival, departure, delay, and platform intelligence for #{selectedTrain.trainNumber}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                        <th className="py-3 px-3">#</th>
                        <th className="py-3 px-3">Station</th>
                        <th className="py-3 px-3">Scheduled</th>
                        <th className="py-3 px-3">Actual / Expected</th>
                        <th className="py-3 px-3">Delay</th>
                        <th className="py-3 px-3">Platform</th>
                        <th className="py-3 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {selectedTrain.timeline.map((stop, idx) => {
                        const isCurrent = stop.status === 'Current'
                        const isDeparted = stop.status === 'Departed' || stop.complete

                        return (
                          <tr
                            key={idx}
                            className={`transition-colors ${
                              isCurrent
                                ? 'bg-emerald-50/80 font-bold text-emerald-950'
                                : 'hover:bg-slate-50/60 text-slate-800'
                            }`}
                          >
                            <td className="py-3 px-3 font-mono text-slate-500 font-medium">
                              {stop.sequence || idx + 1}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">{stop.station}</div>
                              {stop.stationCode && (
                                <span className="text-[10px] font-mono text-slate-500 font-normal">
                                  {stop.stationCode}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600">
                              {stop.scheduledTime || '—'}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-900">
                              {stop.expectedTime || stop.time || '—'}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  stop.delayMinutes > 15
                                    ? 'text-rose-700 bg-rose-50 border-rose-200'
                                    : stop.delayMinutes > 0
                                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                                    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                }`}
                              >
                                {stop.delay || 'On Time'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-700 font-medium">
                              {stop.platform || '—'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {isCurrent ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                  Current Halt
                                </span>
                              ) : isDeparted ? (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  Departed
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-600 font-medium">
                                  Upcoming
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Inspection Panel */}
          <div className="xl:col-span-4 sticky top-6">
            <TrainDetailPanel train={selectedTrain} />
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainSearch
