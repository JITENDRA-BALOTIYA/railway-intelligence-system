import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, Check } from 'lucide-react';
import { LogEntry } from '../types';

interface RecalculationLogProps {
  logs: LogEntry[];
  activeTrainNumber?: string;
}

export const RecalculationLog: React.FC<RecalculationLogProps> = ({
  logs,
  activeTrainNumber,
}) => {
  const [filter, setFilter] = useState<'all' | 'warn' | 'success' | 'info'>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filterLabels: Record<string, string> = {
    all: 'All Events',
    warn: 'Delays & Alerts',
    success: 'Calculations',
    info: 'System Telemetry',
  };

  const filteredLogs = logs.filter((l) => {
    if (filter === 'all') return true;
    return l.type === filter;
  });

  return (
    <div className="w-full h-full bg-white text-slate-800 rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-sm sm:shadow-md flex flex-col justify-between transition-all">
      {/* Header with perfected vertical rhythm and aligned dropdown */}
      <div className="pb-3.5 mb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-start justify-between gap-2">
          {/* Eyebrow & Title with perfected vertical rhythm */}
          <div className="flex flex-col justify-center">
            <span className="recalculation-eyebrow">
              RECALCULATION LOG
            </span>
            <h3 className="recalculation-title">
              Prediction engine activity
            </h3>
          </div>

          {/* Right Status Badge & Filter Group */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Modernized, softened STREAMING indicator with subtle infinite pulse */}
            <span className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border border-emerald-400/30 bg-emerald-50 text-[#1E8A3C] shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 duration-1000" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E8A3C]" />
              </span>
              <span>API CALLS</span>
            </span>

            {/* Perfectly Aligned Feed Filter Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                id="log-filter-button"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="h-7 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg flex items-center gap-1.5 text-[11px] font-mono text-slate-700 cursor-pointer transition-all focus:outline-hidden focus-visible:ring-1 focus-visible:ring-[#12386B]"
                title="Filter prediction feed"
              >
                <Filter className="w-3 h-3 text-[#E8731A]" />
                <span className="hidden xs:inline font-semibold">{filterLabels[filter]}</span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180 text-[#12386B]' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu Panel - Perfectly aligned */}
              {isDropdownOpen && (
                <div
                  role="listbox"
                  aria-labelledby="log-filter-button"
                  className="absolute right-0 top-full mt-1.5 z-50 w-44 bg-white border border-slate-200 shadow-xl rounded-xl p-1 space-y-0.5 text-xs font-mono animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-2 py-1 text-[9px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 mb-0.5">
                    Feed Filter
                  </div>
                  {(['all', 'warn', 'success', 'info'] as const).map((key) => {
                    const isSelected = filter === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setFilter(key);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-amber-50 text-[#12386B] font-bold border border-amber-200/60'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{filterLabels[key]}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#E8731A]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terminal log container: locked to ~8 events (310px) with sleek scrollbar for older events */}
      <div className="w-full h-[310px] max-h-[310px] bg-[#0b111a] text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800/90 font-mono text-xs overflow-y-auto terminal-scrollbar custom-terminal-scrollbar shadow-inner">
        <div className="space-y-2">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 text-[11px] leading-relaxed hover:bg-slate-800/50 px-2 py-1 rounded transition-colors"
              >
                {/* Distinct Accessible High-Contrast Orange Timestamp (WCAG AAA) */}
                <span className="text-[#FFA048] font-bold shrink-0 select-none tracking-tight">
                  {log.time}
                </span>

                {/* Muted Terminal Prompt */}
                <span className="text-slate-500 font-bold shrink-0 select-none">
                  &gt;
                </span>

                {/* High-contrast WCAG-compliant syntax highlighting */}
                <span
                  className={
                    log.type === 'warn'
                      ? 'text-[#FDE047] font-semibold' // Accessible bright yellow for warnings
                      : log.type === 'success'
                      ? 'text-[#6EE7B7] font-medium' // Accessible crisp emerald for calculations
                      : 'text-[#7DD3FC] font-normal' // Accessible clear light blue for telemetry
                  }
                >
                  {log.message}
                </span>
              </div>
            ))
          ) : (
            <div className="text-slate-500 text-center py-8 italic text-xs">
              No log entries match the selected filter.
            </div>
          )}
        </div>
      </div>

      {/* Symmetrical Bottom Footer Strip matching DownstreamForecastTable */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1E8A3C]" />
          <span>
            Forecast via <strong>/api/cascade</strong> · XGBoost model
            {activeTrainNumber ? ` (${activeTrainNumber})` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {filteredLogs.length > 8 && (
            <span className="text-[10px] text-slate-400 hidden xs:inline">
              Scroll for older
            </span>
          )}
          <span className="text-slate-400 font-semibold">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'EVENT' : 'EVENTS'}
          </span>
        </div>
      </div>
    </div>
  );
};
