import React from 'react';
import { AlertTriangle, Train, Gauge, OctagonAlert, RefreshCw } from 'lucide-react';
import { DisruptionType } from '../types';

interface InteractionControlsProps {
  currentDisruption: DisruptionType;
  onSelectDisruption: (disruption: DisruptionType) => void;
  onClear: () => void;
}

export const InteractionControls: React.FC<InteractionControlsProps> = ({
  currentDisruption,
  onSelectDisruption,
  onClear,
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/90 p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Label */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Interactive Delay Injection
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Test how downstream ETAs and confidence ranges react in real-time.
          </p>
        </div>

        {/* Action Buttons & Secondary Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Button: Trigger a signal failure */}
          <button
            onClick={() => onSelectDisruption('signal_failure')}
            aria-pressed={currentDisruption === 'signal_failure'}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#12386B] ${
              currentDisruption === 'signal_failure'
                ? 'bg-[#E8731A] text-white ring-2 ring-amber-400 ring-offset-1'
                : 'bg-[#12386B] text-white hover:bg-[#0e2c54]'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>Trigger a signal failure</span>
          </button>

          {/* Secondary Chips */}
          <button
            onClick={() => onSelectDisruption('preceding_train')}
            aria-pressed={currentDisruption === 'preceding_train'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#12386B] ${
              currentDisruption === 'preceding_train'
                ? 'bg-amber-50 border-[#E8731A] text-[#E8731A] font-bold shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Preceding-train delay</span>
          </button>

          <button
            onClick={() => onSelectDisruption('tsr')}
            aria-pressed={currentDisruption === 'tsr'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#12386B] ${
              currentDisruption === 'tsr'
                ? 'bg-amber-50 border-[#E8731A] text-[#E8731A] font-bold shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>TSR (45 km/h)</span>
          </button>

          <button
            onClick={() => onSelectDisruption('level_crossing')}
            aria-pressed={currentDisruption === 'level_crossing'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#12386B] ${
              currentDisruption === 'level_crossing'
                ? 'bg-amber-50 border-[#E8731A] text-[#E8731A] font-bold shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <OctagonAlert className="w-3.5 h-3.5" />
            <span>Level-crossing closure</span>
          </button>

          {/* Clear / Reset to normal */}
          {currentDisruption !== 'none' && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600"
              title="Reset to normal on-time schedule"
              aria-label="Reset to normal on-time schedule"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#1E8A3C]" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
