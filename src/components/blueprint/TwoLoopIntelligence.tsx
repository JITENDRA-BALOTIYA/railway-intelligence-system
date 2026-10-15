import React from 'react';
import { RefreshCw } from 'lucide-react';
import { BlueprintBadge } from './BlueprintBadge';

export const TwoLoopIntelligence: React.FC = () => {
  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col lg:flex-row items-stretch gap-5">
      {/* Left Title */}
      <div className="lg:w-72 shrink-0 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-[#E8731A] shrink-0">
          <RefreshCw className="w-4 h-4" />
        </div>
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#E8731A] block mb-0.5">
            TWO-LOOP INTELLIGENCE
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
            Predict now. Learn continuously.
          </h3>
        </div>
      </div>

      {/* Right Two Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
        {/* Loop 1: Live prediction loop */}
        <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              TARGET: EVERY 30 SECONDS
            </span>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              Live prediction loop
            </h4>
            <p className="text-xs text-slate-600 font-mono mt-1">
              Ingest → validate → predict → cascade → publish
            </p>
          </div>
          <div className="mt-3">
            <BlueprintBadge type="PROTOTYPE" />
          </div>
        </div>

        {/* Loop 2: Offline evaluation loop */}
        <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] font-bold text-[#E8731A] uppercase tracking-wider block mb-1">
              PERIODICALLY
            </span>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              Offline evaluation loop
            </h4>
            <p className="text-xs text-slate-600 font-mono mt-1">
              Hold-out trains → score → detect drift → retrain
            </p>
          </div>
          <div className="mt-3">
            <BlueprintBadge type="PLANNED" />
          </div>
        </div>
      </div>
    </section>
  );
};
