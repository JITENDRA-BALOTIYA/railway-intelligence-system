import React from 'react';
import { Check } from 'lucide-react';

export const FailSafeAndDeployment: React.FC = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
      {/* Left: Fail-Safe Forecasting */}
      <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#E8731A] block mb-0.5">
            FAIL-SAFE FORECASTING
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mb-4">
            The ETA never goes blank.
          </h3>

          {/* 4-Step Chain */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold inline-flex items-center justify-center mb-1">
                1
              </span>
              <span className="text-[11px] font-semibold text-slate-800 block">Live observation</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold inline-flex items-center justify-center mb-1">
                2
              </span>
              <span className="text-[11px] font-semibold text-slate-800 block">Last valid position</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold inline-flex items-center justify-center mb-1">
                3
              </span>
              <span className="text-[11px] font-semibold text-slate-800 block">Historical section</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold inline-flex items-center justify-center mb-1">
                4
              </span>
              <span className="text-[11px] font-semibold text-slate-800 block">Schedule + recovery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Deployment Path */}
      <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#E8731A] block mb-0.5">
            DEPLOYMENT PATH
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mb-4">
            Scale without replacing railway systems.
          </h3>

          {/* 3 Phases Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Phase 1: Prototype */}
            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span className="text-xs font-bold text-slate-900">Prototype</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                NOW
              </span>
            </div>

            {/* Phase 2: Single-zone pilot */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
                  2
                </span>
                <span className="text-xs font-semibold text-slate-800">Single-zone pilot</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                NEXT
              </span>
            </div>

            {/* Phase 3: Multi-zone network */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
                  3
                </span>
                <span className="text-xs font-semibold text-slate-800">Multi-zone network</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                SCALE
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
