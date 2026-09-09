import { useState } from 'react'
import {
  Heart,
  Share2,
  TrainFront,
  ArrowRight,
  Clock,
  MapPin,
  Gauge,
  Calendar,
  CheckCircle2,
  Radio,
  RefreshCw,
} from 'lucide-react'
import { Badge } from '../common/Badge.jsx'
import { TrainRouteMap } from './TrainRouteMap.jsx'
import { useSavedTrips } from '../../hooks/useSavedTrips.js'
import { useTrain } from '../../context/TrainContext.jsx'

export const TrainDetailPanel = ({ train }) => {
  const [activeTab, setActiveTab] = useState('Overview')
  const { isSaved, toggleSaveTrip } = useSavedTrips()
  const { refreshTrain, isRefreshing } = useTrain()

  if (!train) return null

  const saved = isSaved(train.trainNumber)
  const isDelayed = (train.delay || 0) > 0
  const delayBadgeVariant = train.delay > 20 ? 'red' : train.delay > 5 ? 'orange' : 'green'

  const tabs = ['Overview', 'Route & Schedule', 'Live Tracking']

  const totalDist = train.totalDistanceKm || 0
  const progressPct = train.progress || 0
  const completedDist = train.distanceCoveredKm ?? Math.round((progressPct / 100) * totalDist)
  const remainingDist = train.distanceRemainingKm ?? Math.max(0, totalDist - completedDist)

  const firstHalt = train.timeline && train.timeline.length > 0 ? train.timeline[0] : null
  const lastHalt = train.timeline && train.timeline.length > 0 ? train.timeline[train.timeline.length - 1] : null

  const departsTime = firstHalt?.scheduledTime || firstHalt?.time || '—'
  const arrivesTime = lastHalt?.expectedTime || lastHalt?.scheduledTime || lastHalt?.time || '—'
  const haltsCount = train.totalHalts || (train.timeline ? train.timeline.length : 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-4">
      {/* Panel Top Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              #{train.trainNumber}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">• {train.type || 'Express'}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1 truncate">
            {train.trainName}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={refreshTrain}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => toggleSaveTrip(train.trainNumber)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              saved
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={saved ? 'Remove from Saved' : 'Save Train'}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-100 text-xs font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-2 transition-all cursor-pointer relative ${
              activeTab === tab
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Status Banner */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <TrainFront className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              {train.status === 'Running' ? 'Currently Running' : train.status}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {train.dataSource === 'RAILRADAR' ? '● Live RailRadar Telemetry' : 'Cached Telemetry'}
            </div>
          </div>
        </div>

        <Badge variant={delayBadgeVariant} size="sm">
          {isDelayed ? `+${train.delay} min delay` : 'On Time'}
        </Badge>
      </div>

      {/* Origin & Destination Schedule */}
      <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50/60 border border-slate-100">
        <div>
          <div className="text-xs font-bold text-slate-900 truncate">
            {train.source || `${train.sourceName || 'Origin'} (${train.sourceCode || 'SRC'})`}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 font-mono">
            Dep: <span className="font-bold text-slate-900">{departsTime}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {firstHalt?.scheduledTime ? `Scheduled: ${firstHalt.scheduledTime}` : 'Origin Departure'}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            {firstHalt?.platform || train.platform || 'Platform: —'}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-slate-900 truncate">
            {train.destination || `${train.destName || 'Destination'} (${train.destinationCode || 'DEST'})`}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 font-mono">
            Arr: <span className="font-bold text-slate-900">{arrivesTime}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {lastHalt?.scheduledTime ? `Scheduled: ${lastHalt.scheduledTime}` : 'Terminus Arrival'}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            {lastHalt?.platform || 'Platform: —'}
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[9px] font-semibold text-slate-400 uppercase">Distance</div>
          <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
            {totalDist > 0 ? `${totalDist} km` : '—'}
          </div>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[9px] font-semibold text-slate-400 uppercase">Duration</div>
          <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
            {train.duration || '—'}
          </div>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[9px] font-semibold text-slate-400 uppercase">Avg Speed</div>
          <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
            {train.speed != null ? `${train.speed} km/h` : '—'}
          </div>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[9px] font-semibold text-slate-400 uppercase">Halts</div>
          <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
            {haltsCount > 0 ? haltsCount : '—'}
          </div>
        </div>
      </div>

      {/* Embedded Dynamic Route Map */}
      <TrainRouteMap train={train} />

      {/* Live Progress Bar */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
          <span>Live Journey Progress</span>
          <span className="font-mono text-emerald-700">{progressPct}%</span>
        </div>

        {/* Progress Track */}
        <div className="relative w-full h-2.5 bg-slate-200 rounded-full overflow-visible mb-2">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
          {/* Train indicator icon */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-sm flex items-center justify-center text-white"
            style={{ left: `${Math.max(4, Math.min(progressPct, 96))}%` }}
          >
            <TrainFront className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>{completedDist > 0 ? `${completedDist} km covered` : '0 km'}</span>
          <span>{remainingDist > 0 ? `${remainingDist} km left` : 'At Terminus'}</span>
        </div>
      </div>
    </div>
  )
}
