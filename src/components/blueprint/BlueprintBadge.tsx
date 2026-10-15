import React from 'react';

export type ScopeStatus = 'PROTOTYPE' | 'SIMULATED' | 'PLANNED';

interface BlueprintBadgeProps {
  type: ScopeStatus;
  label?: string;
}

export const BlueprintBadge: React.FC<BlueprintBadgeProps> = ({ type, label }) => {
  if (type === 'PROTOTYPE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-300/80 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>{label || 'PROTOTYPE'}</span>
      </span>
    );
  }

  if (type === 'SIMULATED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-50 text-[#C95E0E] border border-amber-300/80 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E8731A]" />
        <span>{label || 'SIMULATED'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-50 text-slate-600 border border-dashed border-slate-300">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      <span>{label || 'PLANNED'}</span>
    </span>
  );
};
