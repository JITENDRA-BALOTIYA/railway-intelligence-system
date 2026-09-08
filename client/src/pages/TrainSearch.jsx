import { useState } from 'react'
import { useTrain } from '../context/TrainContext.jsx'
import { useTrainSearch } from '../hooks/useTrainSearch.js'
import { TrainDetailPanel } from '../components/tracking/TrainDetailPanel.jsx'
import { Loader } from '../components/common/Loader.jsx'
import { EmptyState } from '../components/common/EmptyState.jsx'
import { Badge } from '../components/common/Badge.jsx'
import {
  Search,
  ArrowLeftRight,
  Calendar,
  ChevronRight,
  TrainFront,
  Sparkles,
  ArrowRight,
  Clock,
  Filter,
} from 'lucide-react'

const sampleMockTrains = [
  {
    trainNumber: '12951',
    trainName: 'Mumbai Rajdhani Express',
    type: 'Superfast',
    source: 'Mumbai Central (MMCT)',
    sourceCode: 'MMCT',
    destination: 'New Delhi (NDLS)',
    destinationCode: 'NDLS',
    runsOn: 'Runs: Daily',
    departs: '16:25',
    arrives: '08:35',
    duration: '16h 10m',
    distance: '1,386 km',
    totalDistanceKm: 1386,
    status: 'Delayed',
    delay: 14,
    speed: 85,
    progress: 62,
    platform: 'Platform: 5',
  },
  {
    trainNumber: '12952',
    trainName: 'Mumbai Rajdhani Express (R)',
    type: 'Superfast',
    source: 'New Delhi (NDLS)',
    sourceCode: 'NDLS',
    destination: 'Mumbai Central (MMCT)',
    destinationCode: 'MMCT',
    runsOn: 'Runs: Daily',
    departs: '16:55',
    arrives: '09:20',
    duration: '16h 25m',
    distance: '1,386 km',
    totalDistanceKm: 1386,
    status: 'On Time',
    delay: 0,
    speed: 88,
    progress: 40,
    platform: 'Platform: 3',
  },
  {
    trainNumber: '22221',
    trainName: 'Mumbai CSMT Vande Bharat',
    type: 'Vande Bharat',
    source: 'Mumbai CSMT (CSMT)',
    sourceCode: 'CSMT',
    destination: 'New Delhi (NDLS)',
    destinationCode: 'NDLS',
    runsOn: 'Runs: 6 days a week (Except Tue)',
    departs: '06:00',
    arrives: '14:05',
    duration: '8h 05m',
    distance: '1,384 km',
    totalDistanceKm: 1384,
    status: 'On Time',
    delay: 0,
    speed: 130,
    progress: 75,
    platform: 'Platform: 1',
  },
  {
    trainNumber: '12137',
    trainName: 'Punjab Mail',
    type: 'Superfast',
    source: 'Mumbai CSMT (CSMT)',
    sourceCode: 'CSMT',
    destination: 'New Delhi (NDLS)',
    destinationCode: 'NDLS',
    runsOn: 'Runs: Daily',
    departs: '13:15',
    arrives: '10:50',
    duration: '21h 35m',
    distance: '1,386 km',
    totalDistanceKm: 1386,
    status: 'Delayed',
    delay: 42,
    speed: 72,
    progress: 55,
    platform: 'Platform: 4',
  },
  {
    trainNumber: '19019',
    trainName: 'Avadh Express',
    type: 'Express',
    source: 'Mumbai Central (MMCT)',
    sourceCode: 'MMCT',
    destination: 'New Delhi (NDLS)',
    destinationCode: 'NDLS',
    runsOn: 'Runs: Daily',
    departs: '15:40',
    arrives: '14:20',
    duration: '22h 40m',
    distance: '1,386 km',
    totalDistanceKm: 1386,
    status: 'Delayed',
    delay: 28,
    speed: 65,
    progress: 30,
    platform: 'Platform: 2',
  },
]

const categories = [
  { id: 'All', label: 'All Trains', count: '12,458' },
  { id: 'Superfast', label: 'Superfast', count: '4,210' },
  { id: 'Express', label: 'Express', count: '3,855' },
  { id: 'Passenger', label: 'Passenger', count: '2,102' },
  { id: 'Vande Bharat', label: 'Vande Bharat', count: '64' },
  { id: 'Others', label: 'Others', count: '2,226' },
]

const popularRoutes = [
  { label: 'NDLS → MMCT', from: 'NDLS', to: 'MMCT' },
  { label: 'HWH → NDLS', from: 'HWH', to: 'NDLS' },
  { label: 'BCT → NDLS', from: 'BCT', to: 'NDLS' },
  { label: 'MAS → BCT', from: 'MAS', to: 'BCT' },
  { label: 'SC → NDLS', from: 'SC', to: 'NDLS' },
]

const TrainSearch = () => {
  const { selectedTrain, setSelectedTrainNumber } = useTrain()
  const { searchTerm, setSearchTerm, trains: apiTrains, loading } = useTrainSearch()

  const [activeCategory, setActiveCategory] = useState('All')
  const [fromStation, setFromStation] = useState('MMCT - Mumbai Central')
  const [toStation, setToStation] = useState('NDLS - New Delhi')
  const [journeyDate, setJourneyDate] = useState('2026-09-09')
  const [trainType, setTrainType] = useState('All Types')
  const [sortBy, setSortBy] = useState('Departure Time')

  const handleSwapStations = () => {
    const temp = fromStation
    setFromStation(toStation)
    setToStation(temp)
  }

  const handlePopularRouteClick = (route) => {
    setFromStation(`${route.from} - Station`)
    setToStation(`${route.to} - Station`)
  }

  // Combine live API search results with reference sample trains
  const displayedTrains = apiTrains.length > 0 && searchTerm ? apiTrains : sampleMockTrains

  const activeTrainData = selectedTrain || displayedTrains[0]

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner matching reference screenshot */}
      <div className="hero-gradient-bg rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Explore Indian Railways
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Find Trains, Plan Journeys, Travel Smarter
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
            Search live trains, check real-time status, compare schedules and get AI-powered insights.
          </p>
        </div>

        {/* Train graphic illustration on the right */}
        <div className="relative w-72 h-32 md:h-36 shrink-0 flex items-center justify-center">
          <div className="w-full h-full rounded-2xl bg-gradient-to-r from-emerald-600/10 via-teal-600/15 to-emerald-600/20 border border-emerald-500/20 flex flex-col items-center justify-center text-center p-4">
            <TrainFront className="w-14 h-14 text-emerald-600 animate-bounce" />
            <span className="text-xs font-bold text-slate-800 mt-1">Vande Bharat Express</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Real-Time Precision Tracking</span>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Grid: Left (Search & Results) + Right (Inspection Panel) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search & Train List (approx 65-70%) */}
        <div className="xl:col-span-8 space-y-5">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Train Search & Directory</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Search, filter and explore trains across the Indian Railway network
              </p>
            </div>
            <button
              type="button"
              onClick={handleSwapStations}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Swap
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] opacity-80 ${
                    activeCategory === cat.id ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  ({cat.count})
                </span>
              </button>
            ))}
          </div>

          {/* Search Inputs Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              {/* From Station */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  From Station
                </label>
                <input
                  type="text"
                  value={fromStation}
                  onChange={(e) => setFromStation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              {/* Swap Button */}
              <div className="sm:col-span-1 flex justify-center pb-1">
                <button
                  type="button"
                  onClick={handleSwapStations}
                  className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                  title="Swap Origin and Destination"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* To Station */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  To Station
                </label>
                <input
                  type="text"
                  value={toStation}
                  onChange={(e) => setToStation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              {/* Journey Date */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Journey Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row: Train Type + Search Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
                  Train Type:
                </label>
                <select
                  value={trainType}
                  onChange={(e) => setTrainType(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option>All Types</option>
                  <option>Superfast Express</option>
                  <option>Rajdhani Express</option>
                  <option>Vande Bharat</option>
                  <option>Mail / Express</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setSearchTerm(fromStation.split('-')[0].trim())}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Search className="w-4 h-4" />
                Search Trains
              </button>
            </div>
          </div>

          {/* Popular Routes */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-600">Popular Routes:</span>
            {popularRoutes.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => handlePopularRouteClick(r)}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* List Header */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-slate-700">
              Showing {displayedTrains.length} trains from MMCT to NDLS
            </span>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-slate-900 font-bold focus:outline-none cursor-pointer"
              >
                <option>Departure Time</option>
                <option>Duration</option>
                <option>Delay</option>
                <option>Speed</option>
              </select>
            </div>
          </div>

          {/* Train List Rows */}
          {loading ? (
            <Loader message="Searching Indian Railway network..." />
          ) : (
            <div className="space-y-3">
              {displayedTrains.map((train) => {
                const isSelected = selectedTrain?.trainNumber === train.trainNumber
                const isDelayed = train.delay > 0
                const typeTone =
                  train.type === 'Vande Bharat'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : train.type === 'Express'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'

                return (
                  <div
                    key={train.trainNumber}
                    onClick={() => setSelectedTrainNumber(train.trainNumber)}
                    className={`bg-white rounded-2xl border p-4 md:p-5 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/10'
                        : 'border-slate-200 hover:border-emerald-400 hover:shadow-xs'
                    }`}
                  >
                    {/* Left: Train Info */}
                    <div className="flex items-start gap-3.5 min-w-[220px]">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                        <TrainFront className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono text-slate-900">
                            {train.trainNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeTone}`}
                          >
                            {train.type || 'Superfast'}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 mt-0.5">
                          {train.trainName}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {train.source || 'Mumbai Central (MMCT)'} →{' '}
                          {train.destination || 'New Delhi (NDLS)'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          {train.runsOn || 'Runs: Daily'}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Timing, Duration, Distance */}
                    <div className="grid grid-cols-4 gap-4 text-center border-y md:border-y-0 md:border-x border-slate-100 py-3 md:py-0 md:px-5 flex-1">
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          Departs
                        </div>
                        <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                          {train.departs || '16:25'}
                        </div>
                        <div className="text-[9px] text-slate-500">{train.sourceCode || 'MMCT'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          Arrives
                        </div>
                        <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                          {train.arrives || '08:35'}
                        </div>
                        <div className="text-[9px] text-slate-500">{train.destinationCode || 'NDLS'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          Duration
                        </div>
                        <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                          {train.duration || '16h 10m'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          Distance
                        </div>
                        <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                          {train.distance || '1,386 km'}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Chevron */}
                    <div className="flex items-center justify-between md:justify-end gap-5 shrink-0">
                      <div className="text-left md:text-right">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Status</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isDelayed ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          />
                          <span
                            className={`text-xs font-bold ${
                              isDelayed ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {train.status}
                          </span>
                        </div>
                        <div
                          className={`text-[11px] font-bold mt-0.5 font-mono ${
                            isDelayed ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {isDelayed ? `+${train.delay} min` : '0 min'}
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Inspection Detail Panel (approx 30-35%) */}
        <div className="xl:col-span-4 sticky top-6">
          <TrainDetailPanel train={activeTrainData} />
        </div>
      </div>
    </div>
  )
}

export default TrainSearch
