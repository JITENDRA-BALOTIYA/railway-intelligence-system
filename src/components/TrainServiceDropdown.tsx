import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Train } from 'lucide-react';
import { TrainListItem } from '../data/trainServices';

interface TrainServiceDropdownProps {
  trains: TrainListItem[];
  selectedTrainId: string;
  onSelectTrain: (trainId: string) => void;
}

export const TrainServiceDropdown: React.FC<TrainServiceDropdownProps> = ({
  trains,
  selectedTrainId,
  onSelectTrain,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTrain = trains.find((t) => t.id === selectedTrainId) || trains[0];

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onSelectTrain(id);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={dropdownRef} className="relative w-full sm:w-[320px]">
      {/* Trigger Button */}
      <button
        type="button"
        id="train-service-button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-9 px-3 bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs rounded-lg flex items-center justify-between text-xs cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#12386B] transition-all"
      >
        <div className="flex items-center gap-1.5 min-w-0 pr-2">
          <Train className="w-3.5 h-3.5 text-[#E8731A] shrink-0" />
          <span className="font-mono font-bold text-[#12386B] shrink-0">
            {selectedTrain.number}
          </span>
          <span className="text-slate-300 shrink-0 font-bold">·</span>
          <span className="font-semibold text-slate-800 truncate">
            {selectedTrain.name}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#12386B]' : ''
          }`}
        />
      </button>

      {/* Floating Menu Panel - Perfectly aligned to trigger width */}
      {isOpen && (
        <div
          role="listbox"
          aria-labelledby="train-service-button"
          className="absolute left-0 top-full mt-1.5 z-50 w-full bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
            <span>{trains.length} trains · real timetable data</span>
            <span>avg delay</span>
          </div>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search number or name"
            aria-label="Search trains"
            className="w-full h-8 px-2.5 mb-1 text-xs rounded-md border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#12386B]"
          />
          <div className="max-h-72 overflow-y-auto space-y-1 pr-0.5">
          {trains
            .filter((t) => {
              const q = query.trim().toLowerCase();
              return !q || t.number.includes(q) || t.name.toLowerCase().includes(q) || t.route.toLowerCase().includes(q);
            })
            .map((t) => {
            const isSelected = t.id === selectedTrainId;
            return (
              <div
                key={t.id}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => handleSelect(t.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(t.id);
                  }
                }}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                  isSelected
                    ? 'bg-amber-50/90 border border-amber-200 text-[#12386B] font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#12386B]">
                      {t.number}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-800 truncate">
                      {t.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {t.route}
                  </span>
                </div>

                {isSelected ? (
                  <Check className="w-4 h-4 text-[#E8731A] shrink-0 ml-2" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {t.typicalDelayMin !== null ? `+${Math.round(t.typicalDelayMin)}m` : '—'}
                  </span>
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
};
