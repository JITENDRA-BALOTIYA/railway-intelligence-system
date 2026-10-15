import React, { useEffect, useState } from 'react';
import type { BoardRow } from '../SystemPerspectivesTabs';

interface StationDisplayViewProps {
  rows: BoardRow[];
  loading: boolean;
  activeTrainNumber?: string;
  onSelectTrain?: (trainId: string) => void;
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return now.toLocaleTimeString('en-GB');
}

export const StationDisplayView: React.FC<StationDisplayViewProps> = ({
  rows,
  loading,
  activeTrainNumber,
  onSelectTrain,
}) => {
  const clock = useClock();

  const stationTrains = rows.map((r) => ({
    id: r.id,
    number: r.number,
    name: r.name.toUpperCase(),
    dest: r.dest.toUpperCase(),
    pf: '—', // platform allocation is not in any public dataset
    isActive: r.number === activeTrainNumber,
    scheduled: r.scheduled,
    predicted: r.predicted,
    delayMin: r.delayMin,
    status: r.isDelayed ? 'DELAYED' : 'ON TIME',
    rangeText: r.rangeText,
  }));

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-xl p-3 sm:p-5 shadow-lg border border-slate-800">
      {/* Board Header: LED Airport / Railway display styling */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="font-mono text-xs sm:text-base font-bold tracking-wider text-amber-400 uppercase">
            STATION ARRIVALS BOARD • SIMULATED POSITIONS
          </h3>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-slate-400">
          <span className="hidden xs:inline">TIME: {clock}</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-amber-300">SOURCE: API · default scenario</span>
          <span className="text-[10px] text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            Click row to select train
          </span>
        </div>
      </div>

      {/* Board Table */}
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-left font-mono text-xs min-w-[620px]">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
              <th className="py-2 px-2" scope="col">Train</th>
              <th className="py-2 px-2" scope="col">Destination</th>
              <th className="py-2 px-2 text-center" scope="col">PF</th>
              <th className="py-2 px-2 text-right" scope="col">Sch</th>
              <th className="py-2 px-2 text-right text-amber-400 font-bold" scope="col">Predicted (P50)</th>
              <th className="py-2 px-2 text-center" scope="col">Delay</th>
              <th className="py-2 px-2 text-right" scope="col">Confidence Window</th>
              <th className="py-2 px-2 text-center" scope="col">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading && stationTrains.length < 2 && (
              <tr>
                <td colSpan={8} className="py-4 px-2 text-center text-slate-400">Loading other trains from the API…</td>
              </tr>
            )}
            {stationTrains.map((train) => (
              <tr
                key={train.number}
                onClick={() => onSelectTrain?.(train.id)}
                className={`transition-colors cursor-pointer hover:bg-slate-900/80 ${
                  train.isActive ? 'bg-amber-950/40 ring-1 ring-amber-500/50' : ''
                }`}
                title="Click to switch active focus across entire system"
              >
                <td className="py-3 px-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-amber-300 text-xs sm:text-sm">
                        {train.number}
                      </span>
                      {train.isActive && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                          Selected
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{train.name}</span>
                  </div>
                </td>

                <td className="py-3 px-2 text-slate-300 font-semibold">
                  {train.dest}
                </td>

                <td className="py-3 px-2 text-center">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-bold border border-slate-700">
                    {train.pf}
                  </span>
                </td>

                <td className="py-3 px-2 text-right text-slate-400">
                  {train.scheduled}
                </td>

                <td className="py-3 px-2 text-right font-bold text-amber-300 text-sm">
                  {train.predicted}
                </td>

                <td className="py-3 px-2 text-center">
                  {train.delayMin > 0 ? (
                    <span className="text-[#E8731A] font-bold">+{train.delayMin}m</span>
                  ) : (
                    <span className="text-[#1E8A3C] font-semibold">0m</span>
                  )}
                </td>

                <td className="py-3 px-2 text-right text-slate-300">
                  {train.rangeText}
                </td>

                <td className="py-3 px-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      train.delayMin > 0
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {train.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Board Footnote ticker */}
      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 text-amber-400/90 truncate mr-2">
          <span className="animate-pulse shrink-0">●</span>
          <span className="truncate">FORECAST = SCHEDULE + MODEL-PREDICTED DELAY · PLATFORM DATA NOT AVAILABLE</span>
        </div>
        <span className="hidden sm:inline text-slate-500 shrink-0">PROTOTYPE · NOT AN OFFICIAL INDIAN RAILWAYS DISPLAY</span>
      </div>
    </div>
  );
};
