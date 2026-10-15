import React from 'react';
import { BlueprintBadge } from './BlueprintBadge';

export const OfflineValidationBanner: React.FC = () => {
  return (
    <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#E8731A] block mb-0.5">
          OFFLINE MODEL VALIDATION
        </span>
        <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
          Prove improvement before deployment
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
        <span>Hold out whole service pairs</span>
        <span className="text-[#E8731A]">→</span>
        <span>Compare with baseline</span>
        <span className="text-[#E8731A]">→</span>
        <span>Measure MAE · coverage</span>
        <span className="text-[#E8731A]">→</span>
        <span>Retrain when drift appears</span>
      </div>

      <div className="shrink-0">
        <BlueprintBadge type="PROTOTYPE" />
      </div>
    </section>
  );
};
