import React from 'react';
import { Cloud, Radio, Gauge, AlertTriangle, Play, SlidersHorizontal, Activity } from 'lucide-react';
import { NetworkConditions } from '../types';
import { cumulativeImpactMin, SCENARIO_IMPACT_MIN } from '../utils/scenario';
import { StatusChip } from './StatusChip';

interface NetworkConditionsPanelProps {
  conditions: NetworkConditions;
  onToggleCondition: (key: keyof NetworkConditions) => void;
  onInjectUnscheduled: () => void;
  onStartProof: () => void;
  isProofRunning: boolean;
  currentStopName: string;
  currentDelay: number;
  typicalDelay: number;
  onCurrentDelayChange: (v: number) => void;
}

export const NetworkConditionsPanel: React.FC<NetworkConditionsPanelProps> = ({
  conditions,
  onToggleCondition,
  onInjectUnscheduled,
  onStartProof,
  isProofRunning,
  currentStopName,
  currentDelay,
  typicalDelay,
  onCurrentDelayChange,
}) => {
  // Minutes the active (simulated) switches add; the API applies the same assumed rules
  const cumulativeAddedDelay = cumulativeImpactMin(conditions);

  return (
    <div className="w-full bg-white text-slate-800 rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header with real-time active delay counter */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#E8731A]">
                SCENARIO INPUTS · SIMULATED
              </span>
              {cumulativeAddedDelay > 0 ? (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  +{cumulativeAddedDelay}m IMPACT
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  NOMINAL
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#12386B] tracking-tight">
              Change network conditions
            </h3>
          </div>

          <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-[#12386B]">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </div>

        {/* Observed delay at the current stop (simulated RTIS input) */}
        <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="current-delay" className="text-xs font-semibold text-slate-800">
              Delay observed at {currentStopName}
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#12386B]">+{currentDelay} min</span>
              <StatusChip status="SIMULATED" label="INPUT" />
            </div>
          </div>
          <input
            id="current-delay"
            type="range"
            min={0}
            max={90}
            step={1}
            value={currentDelay}
            onChange={(e) => onCurrentDelayChange(Number(e.target.value))}
            className="w-full mt-2 accent-[#E8731A]"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-0.5">
            <span>0</span>
            <button
              type="button"
              onClick={() => onCurrentDelayChange(typicalDelay)}
              className="underline decoration-dotted hover:text-[#12386B]"
              title="Reset to the real 1-year average delay at this station"
            >
              reset to typical (+{typicalDelay} min, real avg)
            </button>
            <span>90</span>
          </div>
        </div>

        {/* 3 Interactive Toggle Switch Rows with Causal Impact Badges */}
        <div className="mt-4 space-y-4">
          {/* Toggle 1: Severe weather ahead */}
          <div className="flex items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg mt-0.5 transition-colors ${
                  conditions.severeWeather
                    ? 'bg-amber-100 text-[#E8731A]'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-800 leading-snug">
                    Severe weather ahead
                  </h4>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors ${
                      conditions.severeWeather
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    +{SCENARIO_IMPACT_MIN.severeWeather}m
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Override · replaces live Open-Meteo severity
                </p>
              </div>
            </div>

            {/* Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={conditions.severeWeather}
              aria-label="Toggle severe weather ahead"
              onClick={() => onToggleCondition('severeWeather')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#12386B] ${
                conditions.severeWeather ? 'bg-[#E8731A]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  conditions.severeWeather ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Preceding train delayed */}
          <div className="flex items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg mt-0.5 transition-colors ${
                  conditions.precedingTrainDelayed
                    ? 'bg-amber-100 text-[#E8731A]'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-800 leading-snug">
                    Preceding train delayed
                  </h4>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors ${
                      conditions.precedingTrainDelayed
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    +{SCENARIO_IMPACT_MIN.precedingTrainDelayed}m cascade
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  0.4 × preceding train's delay (assumed rule)
                </p>
              </div>
            </div>

            {/* Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={conditions.precedingTrainDelayed}
              aria-label="Toggle preceding train delayed"
              onClick={() => onToggleCondition('precedingTrainDelayed')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#12386B] ${
                conditions.precedingTrainDelayed ? 'bg-[#E8731A]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  conditions.precedingTrainDelayed ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Temporary speed restriction */}
          <div className="flex items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg mt-0.5 transition-colors ${
                  conditions.tsrActive
                    ? 'bg-amber-100 text-[#E8731A]'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-800 leading-snug">
                    Temporary speed restriction
                  </h4>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors ${
                      conditions.tsrActive
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    slow order (+{SCENARIO_IMPACT_MIN.tsrActive}m)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Civil engineering slow order
                </p>
              </div>
            </div>

            {/* Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={conditions.tsrActive}
              aria-label="Toggle temporary speed restriction"
              onClick={() => onToggleCondition('tsrActive')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#12386B] ${
                conditions.tsrActive ? 'bg-[#E8731A]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  conditions.tsrActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
        {/* Button 1: Inject unscheduled disruption */}
        <button
          onClick={onInjectUnscheduled}
          className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-lg text-xs font-bold transition-all border ${
            conditions.unscheduledDisruption
              ? 'bg-rose-50 border-rose-300 text-rose-700 ring-1 ring-rose-400/40 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${conditions.unscheduledDisruption ? 'text-rose-600' : 'text-[#E8731A]'}`} />
            <span>
              {conditions.unscheduledDisruption
                ? 'Unscheduled disruption active (Clear)'
                : 'Inject unscheduled disruption'}
            </span>
          </div>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
              conditions.unscheduledDisruption
                ? 'bg-rose-200/60 text-rose-800'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {conditions.unscheduledDisruption ? `+${SCENARIO_IMPACT_MIN.unscheduledDisruption}m HOLD` : `+${SCENARIO_IMPACT_MIN.unscheduledDisruption}m`}
          </span>
        </button>

        {/* Button 2: Start 8-second proof (Primary Action) */}
        <button
          onClick={onStartProof}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs sm:text-sm font-bold text-white shadow-sm transition-all ${
            isProofRunning
              ? 'bg-amber-600 ring-2 ring-amber-400 ring-offset-2 ring-offset-white animate-pulse'
              : 'bg-[#E8731A] hover:bg-[#d66512] active:scale-[0.99]'
          }`}
        >
          {isProofRunning ? (
            <Activity className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{isProofRunning ? 'Running 8-second proof sequence...' : 'Start 8-second proof'}</span>
        </button>

        {/* Micro Subcaption with Stepper Explanation */}
        <p className="text-[11px] font-mono text-center text-slate-500 pt-0.5">
          {isProofRunning ? (
            <span className="text-amber-700 font-semibold animate-pulse">
              Observing real-time ETA delta, confidence range, and cascade logs
            </span>
          ) : (
            'Every step calls the API · watch ETA, range and downstream stations react'
          )}
        </p>
      </div>
    </div>
  );
};
