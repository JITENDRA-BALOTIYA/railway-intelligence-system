import { useState, useCallback } from 'react'
import {
  Search, RefreshCw, Download, Share2,
  Clock, TrendingUp, Gauge, MapPin, Zap,
  ChevronRight, ArrowRightLeft, CalendarDays,
  RotateCcw, Sparkles,
} from 'lucide-react'
import { useETAPrediction } from '../hooks/useETAPrediction.js'
import { StationEtaTimeline } from '../components/eta/StationEtaTimeline.jsx'
import { DelayTrendChart } from '../components/eta/DelayTrendChart.jsx'
import { PredictedVsActualChart } from '../components/eta/PredictedVsActualChart.jsx'
import { DelayCausesDonut } from '../components/eta/DelayCausesDonut.jsx'
import { TrainInfoPanel } from '../components/eta/TrainInfoPanel.jsx'
import { LiveEtaMap } from '../components/eta/LiveEtaMap.jsx'

const QUICK_TRAINS = ['12951', '12002', '12310', '12555', '12259']
const TABS = ['Single Train', 'Route Comparison', 'Batch Prediction', 'ML Insights', 'What-If Analysis']
const TAB_ICONS = ['🚆', '🔀', '📋', '🧠', '⚙️']
const PREDICTION_MODELS = ['AI + Live Data (Default)', 'ML Model v3', 'Statistical', 'Hybrid']

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, badge, sub, progress, progressColor }) => (
  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      {badge && (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full font-mono ${badge.color}`}>
          {badge.text}
        </span>
      )}
    </div>
    <div>
      <div className="text-[11px] text-slate-500 font-medium">{label}</div>
      <div className="text-2xl font-extrabold text-slate-900 font-mono leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
    {progress != null && (
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
        <div
          className={`h-full rounded-full ${progressColor || 'bg-emerald-500'} transition-all duration-700`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    )}
  </div>
)

// ─── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = ({ onSearch }) => {
  const [val, setVal] = useState('')
  return (
    <div className="bg-white rounded-2xl p-12 border border-slate-200/90 shadow-xs text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-xs">
        <Zap className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-900">Enter a train number to begin</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
        AI-powered arrival & departure predictions with real-time data, delay analysis, and proactive recommendations.
      </p>
      <form
        onSubmit={(e) => { e.preventDefault(); if (val.trim()) onSearch(val.trim()) }}
        className="max-w-sm mx-auto mt-6 flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Train number (e.g. 12951)..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
        >
          Predict ETA
        </button>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] text-slate-400">Quick Trains:</span>
        {QUICK_TRAINS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onSearch(n)}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono cursor-pointer transition-colors"
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ETAPrediction = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [trainInput, setTrainInput] = useState('12951')
  const [fromStation, setFromStation] = useState('NDLS - New Delhi')
  const [toStation, setToStation] = useState('CNB - Kanpur Central')
  const [journeyDate] = useState('Today, 14 Sept 2026')
  const [predModel, setPredModel] = useState(PREDICTION_MODELS[0])
  const [liveMode, setLiveMode] = useState(true)
  const [submittedTrain, setSubmittedTrain] = useState('')

  const { fullData, fullLoading, refreshFull } = useETAPrediction(submittedTrain)

  const handlePredict = useCallback((num) => {
    const tn = (num || trainInput).trim()
    if (!tn) return
    setSubmittedTrain(tn)
    setTrainInput(tn)
  }, [trainInput])

  const handleQuickTrain = (num) => {
    setTrainInput(num)
    setSubmittedTrain(num)
  }

  const d = fullData
  const delay = d?.currentDelayMinutes ?? 0

  return (
    <div className="space-y-4 pb-8">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">ETA Prediction</h1>
            <p className="hidden sm:block text-xs text-slate-400 font-medium">
              AI-powered arrival & departure predictions with real-time data, delay analysis and proactive recommendations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-slate-600">Live Data</span>
            <div
              onClick={() => setLiveMode((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${liveMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${liveMode ? 'left-5' : 'left-0.5'}`} />
            </div>
          </label>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      {/* ── Tab Bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === i
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{TAB_ICONS[i]}</span>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Search Form ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Train Number */}
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Train Number</label>
            <div className="relative">
              <input
                value={trainInput}
                onChange={(e) => setTrainInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
                placeholder="12951"
                className="w-full px-3 py-2.5 pr-9 rounded-xl border border-slate-200 text-sm font-bold font-mono text-slate-900 focus:outline-none focus:border-emerald-500 bg-slate-50"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* From Station */}
          <div className="flex-[2] min-w-[160px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">From Station</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 bg-slate-50"
              />
            </div>
          </div>

          {/* Swap */}
          <button
            type="button"
            onClick={() => { const t = fromStation; setFromStation(toStation); setToStation(t) }}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors self-end mb-0.5"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          {/* To Station */}
          <div className="flex-[2] min-w-[160px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">To Station</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500" />
              <input
                value={toStation}
                onChange={(e) => setToStation(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 bg-slate-50"
              />
            </div>
          </div>

          {/* Date */}
          <div className="flex-[1.5] min-w-[140px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Journey Date</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                readOnly
                value={journeyDate}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 cursor-default"
              />
            </div>
          </div>

          {/* Predict Button */}
          <button
            type="button"
            onClick={() => handlePredict()}
            disabled={fullLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold transition-all cursor-pointer shadow-xs shrink-0 self-end"
          >
            {fullLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            Predict ETA
          </button>

          {/* Model selector */}
          <div className="flex-[2] min-w-[160px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Prediction Model</label>
            <select
              value={predModel}
              onChange={(e) => setPredModel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {PREDICTION_MODELS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Quick Train chips */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-slate-400 font-semibold">Quick Trains:</span>
          {QUICK_TRAINS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleQuickTrain(n)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer border ${
                submittedTrain === n
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* ── No train selected ─────────────────────────────────────────────── */}
      {!submittedTrain && !fullLoading && (
        <EmptyState onSearch={handlePredict} />
      )}

      {/* ── Loading spinner ───────────────────────────────────────────────── */}
      {fullLoading && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/90 shadow-xs flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-sm font-bold text-slate-700">Computing AI arrival forecast for train #{submittedTrain}...</p>
          <p className="text-xs text-slate-400">Fetching live telemetry, corridor friction & delay cascade models</p>
        </div>
      )}

      {/* ── Main Dashboard (only when fullData loaded) ─────────────────────── */}
      {d && !fullLoading && (
        <>
          {/* ── 5 Stat Cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard
              icon={Clock}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              label="Predicted Arrival (CNB)"
              value={d.predictedArrival || '19:42'}
              badge={{ text: `+${delay} min`, color: delay > 0 ? 'text-orange-700 bg-orange-50' : 'text-emerald-700 bg-emerald-50' }}
              sub="(Expected)"
            />
            <StatCard
              icon={TrendingUp}
              iconBg="bg-orange-50"
              iconColor="text-orange-500"
              label="Current Delay"
              value={`+${delay} min`}
              badge={{ text: 'vs. Schedule', color: 'text-slate-500 bg-slate-100' }}
            />
            <StatCard
              icon={Sparkles}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
              label="On-time Probability"
              value={`${d.onTimeProbability || 68}%`}
              badge={{ text: `+${Math.abs((d.onTimeProbability || 68) - 56)}%`, color: 'text-blue-600 bg-blue-50' }}
              progress={d.onTimeProbability || 68}
              progressColor="bg-blue-500"
            />
            <StatCard
              icon={MapPin}
              iconBg="bg-violet-50"
              iconColor="text-violet-500"
              label="Distance Remaining"
              value={`${d.distanceRemainingKm || 342} km`}
              progress={d.distanceProgress || 61}
              progressColor="bg-violet-500"
              sub={`${d.distanceProgress || 61}% complete`}
            />
            <StatCard
              icon={Gauge}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              label="Average Speed"
              value={`${d.averageSpeed || 87} km/h`}
              badge={{
                text: `${d.avgSpeedDelta >= 0 ? '+' : ''}${d.avgSpeedDelta || 5}% vs. Avg`,
                color: (d.avgSpeedDelta || 5) >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50',
              }}
            />
          </div>

          {/* ── 3-Column Main Grid: Map | Timeline | Train Info ────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Map */}
            <div className="lg:col-span-4" style={{ minHeight: 380 }}>
              <LiveEtaMap
                stations={d.liveMapStations}
                currentPos={d.currentPos}
                trainNumber={d.trainNumber}
              />
            </div>

            {/* Station Timeline */}
            <div className="lg:col-span-5" style={{ minHeight: 380 }}>
              <StationEtaTimeline
                stations={d.stationTimeline || []}
                onViewFull={() => {}}
              />
            </div>

            {/* Train Info Panel */}
            <div className="lg:col-span-3" style={{ minHeight: 380 }}>
              <TrainInfoPanel trainInfo={d.trainInfo} />
            </div>
          </div>

          {/* ── Bottom 3-Column: Charts + AI ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Delay Trend */}
            <div style={{ minHeight: 220 }}>
              <DelayTrendChart data={d.delayTrend || []} />
            </div>

            {/* Predicted vs Actual */}
            <div style={{ minHeight: 220 }}>
              <PredictedVsActualChart data={d.predictedVsActual || []} />
            </div>

            {/* Delay Causes Donut + AI Insights */}
            <div>
              <DelayCausesDonut
                causes={d.delayCauses || []}
                insights={d.aiInsights || []}
                currentDelay={delay}
              />
            </div>
          </div>

          {/* ── Footer Banner ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 flex-wrap">
                {[
                  { value: '12,468', label: 'Trains Monitored' },
                  { value: '98.7%', label: 'Prediction Accuracy' },
                  { value: 'Real-time Data', label: 'From Indian Railways' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-base font-extrabold text-slate-900">{s.value}</div>
                    <div className="text-[11px] text-slate-400">{s.label}</div>
                  </div>
                ))}
                <div>
                  <div className="text-sm font-bold text-slate-700">Smarter Railways</div>
                  <div className="text-[11px] text-slate-400">For a Connected India</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Indian Railways logo placeholder */}
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold text-center leading-tight">भारतीय रेल</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">INDIAN RAILWAYS</div>
                  <div className="text-[10px] text-slate-400">Safety · Punctuality · A Better Tomorrow</div>
                </div>

                <button
                  type="button"
                  onClick={() => refreshFull(submittedTrain)}
                  className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ETAPrediction
