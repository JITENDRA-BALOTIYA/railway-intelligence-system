import React from 'react';
import { ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PredictionResult } from '../utils/prediction';

interface DownstreamStation {
  code: string;
  name: string;
  scheduledTime: string;
  predictedTime: string;
  delayMin: number;
}

interface EtaComparisonCardProps {
  prediction: PredictionResult;
  downstreamStations: DownstreamStation[];
}

export const EtaComparisonCard: React.FC<EtaComparisonCardProps> = ({
  prediction,
  downstreamStations,
}) => {
  const isDelayed = prediction.delayMinutes > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* LEFT CARD: Static Schedule */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h2 className="font-bold text-sm text-slate-700 tracking-tight">
                Static schedule
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
              Fixed timetable
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Kota Jn (KOTA) Arrival
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-slate-700">
                {prediction.scheduledEta}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                No confidence range
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500 font-normal leading-relaxed">
              Assumes ideal section clearance. Does not react to real operational disturbances.
            </p>
          </div>
        </div>

        {/* Static downstream list */}
        <div className="mt-5 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Downstream station timetable
          </span>
          <div className="space-y-1.5">
            {downstreamStations.map((st) => (
              <div
                key={st.code}
                className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 text-slate-600 font-mono"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-700">{st.code}</span>
                  <span className="text-slate-400 font-sans text-[11px] truncate max-w-[120px]">{st.name}</span>
                </div>
                <span className="font-semibold text-slate-600">{st.scheduledTime} (Fixed)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT CARD: Rail Intelligence */}
      <div className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
        isDelayed ? 'border-amber-300 ring-2 ring-amber-100/60' : 'border-emerald-300'
      }`}>
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isDelayed ? 'bg-[#E8731A] animate-pulse' : 'bg-[#1E8A3C]'}`} />
              <h2 className="font-bold text-sm text-[#12386B] tracking-tight">
                Rail Intelligence
              </h2>
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              isDelayed ? 'bg-amber-100 text-[#E8731A]' : 'bg-emerald-100 text-[#1E8A3C]'
            }`}>
              {isDelayed ? `+${prediction.delayMinutes} min delay` : 'On Time'}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Predicted Arrival at Kota Jn
              </span>
              <span className="text-xs font-mono font-bold text-slate-600">
                Range ±{prediction.rangeMinutes} min
              </span>
            </div>

            <div className="mt-1 flex items-baseline gap-3">
              <span className={`text-4xl sm:text-5xl font-extrabold font-mono tracking-tight transition-all duration-300 ${
                isDelayed ? 'text-[#E8731A]' : 'text-[#12386B]'
              }`}>
                {prediction.predictedEta}
              </span>
              <div className="flex flex-col text-xs font-mono text-slate-600">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Prediction Interval</span>
                <span className="font-bold">{prediction.rangeText}</span>
              </div>
            </div>

            {/* Range Bar Visualizer */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span>
                  <span className="hidden sm:inline">Earliest: </span>
                  <span className="sm:hidden">Min: </span>
                  <strong className="text-slate-700 font-semibold">{prediction.rangeLower}</strong>
                </span>
                <span className="font-semibold text-slate-700">
                  P50: {prediction.predictedEta}
                </span>
                <span>
                  <span className="hidden sm:inline">Latest: </span>
                  <span className="sm:hidden">Max: </span>
                  <strong className="text-slate-700 font-semibold">{prediction.rangeUpper}</strong>
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full relative overflow-hidden ring-1 ring-slate-200">
                {/* Confidence band */}
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDelayed ? 'bg-gradient-to-r from-amber-400 to-[#E8731A]' : 'bg-gradient-to-r from-emerald-400 to-[#1E8A3C]'
                  }`}
                  style={{
                    width: isDelayed ? '82%' : '40%',
                    marginLeft: isDelayed ? '9%' : '30%',
                  }}
                />
                {/* Center marker */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-900/60 -translate-x-1/2" />
              </div>
            </div>

            {/* Brief Reason Line (concise max ~12 words) */}
            <div className="mt-3 flex items-start gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
              {isDelayed ? (
                <ShieldAlert className="w-4 h-4 text-[#E8731A] shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#1E8A3C] shrink-0 mt-0.5" />
              )}
              <div className="text-slate-700 font-medium">
                <span className="font-semibold text-[#12386B]">Operational context: </span>
                <span>{prediction.reason}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic downstream station ETAs with cascading logic */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Dynamic downstream cascaded ETAs
            </span>
            <span className="text-[10px] font-mono text-slate-400">0.4x cascade propagation</span>
          </div>
          <div className="space-y-1.5">
            {downstreamStations.map((st) => (
              <div
                key={st.code}
                className={`flex items-center justify-between text-xs py-1 px-2 rounded font-mono transition-colors ${
                  st.delayMin > 0 ? 'bg-amber-50/70 text-amber-900 border border-amber-200/60' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#12386B]">{st.code}</span>
                  <span className="text-slate-500 font-sans text-[11px] truncate max-w-[120px]">{st.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 line-through text-[11px]">{st.scheduledTime}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="font-bold">{st.predictedTime}</span>
                  {st.delayMin > 0 && (
                    <span className="text-[10px] font-semibold text-[#E8731A] bg-amber-100 px-1 rounded">
                      +{st.delayMin}m
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
