import React from 'react';

interface StationForecastItem {
  code: string;
  name: string;
  scheduledTime: string;
  predictedTime: string;
  windowText: string;
  stateText: 'ON TIME' | 'DELAYED' | 'PASSED';
  delayMin: number;
}

interface DownstreamForecastTableProps {
  stations: StationForecastItem[];
}

export const DownstreamForecastTable: React.FC<DownstreamForecastTableProps> = ({ stations }) => {
  return (
    <div className="w-full h-full bg-white text-slate-800 rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-sm sm:shadow-md flex flex-col justify-between transition-all">
      {/* Header with perfected vertical rhythm matching RecalculationLog */}
      <div className="pb-3.5 mb-3 border-b border-slate-100 shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col justify-center">
            <span className="recalculation-eyebrow">
              DOWNSTREAM FORECAST
            </span>
            <h3 className="recalculation-title">
              Station-by-station recalculation
            </h3>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border border-amber-400/30 bg-amber-50 text-[#E8731A] shadow-xs shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8731A]" />
            <span>XGBOOST + SIMULATED INPUTS</span>
          </span>
        </div>
      </div>

      {/* Table container filling available height smoothly matching RecalculationLog */}
      <div className="w-full h-[310px] max-h-[310px] overflow-y-auto overflow-x-auto terminal-scrollbar custom-terminal-scrollbar">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
              <th className="py-2.5 px-2" scope="col">Station</th>
              <th className="py-2.5 px-2" scope="col">Schedule</th>
              <th className="py-2.5 px-2" scope="col">Predicted</th>
              <th className="py-2.5 px-2" scope="col">Window</th>
              <th className="py-2.5 px-2 text-right" scope="col">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 tabular-nums">
            {stations.map((st) => {
              const isDelayed = st.stateText === 'DELAYED';
              const isPassed = st.stateText === 'PASSED';

              return (
                <tr key={st.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#12386B]">{st.code}</span>
                      <span className="text-slate-700 font-sans text-xs font-medium">{st.name}</span>
                    </div>
                  </td>

                  <td className="py-2.5 px-2 text-slate-600 font-medium">
                    {st.scheduledTime}
                  </td>

                  <td className="py-2.5 px-2">
                    <span className={`font-bold ${isDelayed ? 'text-[#E8731A]' : 'text-slate-900'}`}>
                      {st.predictedTime}
                    </span>
                    {st.delayMin > 0 && (
                      <span className="inline-block text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1 py-0.2 rounded ml-1.5 font-bold">
                        +{st.delayMin}m
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-slate-600 font-medium">
                    {st.windowText}
                  </td>

                  <td className="py-2.5 px-2 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-xs ${
                        isPassed
                          ? 'bg-slate-100 border-slate-300 text-slate-600'
                          : isDelayed
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      }`}
                    >
                      {st.stateText}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Symmetrical Bottom Footer Strip matching RecalculationLog */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1E8A3C]" />
          <span>Delay propagated with <strong>XGBoost route priors</strong> · window = P10–P90</span>
        </div>
        <span className="text-slate-400 font-semibold">{stations.length} STATIONS FORECAST</span>
      </div>
    </div>
  );
};
