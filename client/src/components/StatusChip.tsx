import React from 'react';
import { Activity, Cpu, Clock } from 'lucide-react';

export type StatusType = 'LIVE' | 'SIMULATED' | 'PLANNED';

interface StatusChipProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  size = 'sm',
  className = '',
}) => {
  const displayLabel = label || status;
  const isSm = size === 'sm';

  if (status === 'LIVE') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-md border ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-emerald-50 text-[#1E8A3C] border-emerald-200/80 shadow-xs ${className}`}
        title="Live real-time feed"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E8A3C] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E8A3C]"></span>
        </span>
        <Activity className={isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        <span>{displayLabel}</span>
      </span>
    );
  }

  if (status === 'SIMULATED') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-md border ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-amber-50 text-[#E8731A] border-amber-300/80 shadow-xs ${className}`}
        title="Simulated operational scenario"
      >
        <Cpu className={isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        <span>{displayLabel}</span>
      </span>
    );
  }

  // PLANNED
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-md border border-dashed ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } bg-slate-100/70 text-slate-600 border-slate-400/80 ${className}`}
      title="Planned production feature"
    >
      <Clock className={isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      <span>{displayLabel}</span>
    </span>
  );
};
