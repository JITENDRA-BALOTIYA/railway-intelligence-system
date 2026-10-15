import React from 'react';
import { AlertTriangle, Radio, BellRing, Lock } from 'lucide-react';
import { StatusChip } from '../StatusChip';
import type { BoardRow } from '../SystemPerspectivesTabs';

interface ControlRoomViewProps {
  rows: BoardRow[];
  loading: boolean;
  activeTrainNumber?: string;
  activeSection?: string;
  reason: string;
  onSelectTrain?: (trainId: string) => void;
}

export const ControlRoomView: React.FC<ControlRoomViewProps> = ({
  rows,
  loading,
  activeTrainNumber,
  activeSection,
  reason,
  onSelectTrain,
}) => {
  const controlTrains = rows.map((r) => {
    const isActive = r.number === activeTrainNumber;
    return {
      id: r.id,
      number: r.number,
      name: r.name,
      zone: r.classLabel,
      section: isActive ? activeSection || r.section : r.section,
      delayMin: r.delayMin,
      disruption: isActive ? reason : 'No scenario · typical running',
      rangeWidth: r.rangeText,
      isActive,
    };
  });

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
      {/* Top Bar with Controller Info & Secure Login Planned Item */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#12386B]" />
          <h3 className="font-bold text-sm text-[#12386B] tracking-tight">
            Section Controller Operations Console
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">{controlTrains.length} trains monitored{loading ? ' (loading…)' : ''}</span>
        </div>

        {/* Secure login item with PLANNED chip */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Role-Based Secure Login</span>
          <StatusChip status="PLANNED" label="PLANNED" />
        </div>
      </div>

      {/* 4 Trains Across 3 Zones Table */}
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-left text-xs min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider bg-slate-50/80">
              <th className="py-2 px-3 font-semibold" scope="col">Train Service</th>
              <th className="py-2 px-2 font-semibold" scope="col">Class</th>
              <th className="py-2 px-2 font-semibold" scope="col">Track Section</th>
              <th className="py-2 px-2 font-semibold text-center" scope="col">Delay</th>
              <th className="py-2 px-3 font-semibold" scope="col">Active Disruption</th>
              <th className="py-2 px-2 font-semibold text-center" scope="col">Range Width</th>
              <th className="py-2 px-2 font-semibold text-right" scope="col">Action State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {controlTrains.map((train) => (
              <tr
                key={train.id}
                onClick={() => onSelectTrain?.(train.id)}
                className={`transition-colors cursor-pointer ${
                  train.isActive ? 'bg-amber-50/70 font-semibold ring-1 ring-amber-300' : 'hover:bg-slate-50/80'
                }`}
                title="Click to set active train focus"
              >
                <td className="py-2.5 px-3">
                  <div className="flex flex-col font-sans">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">{train.number}</span>
                      {train.isActive && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                          Active Focus
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{train.name}</span>
                  </div>
                </td>

                <td className="py-2.5 px-2">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#12386B]/10 text-[#12386B]">
                    {train.zone}
                  </span>
                </td>

                <td className="py-2.5 px-2 text-slate-700 font-medium">
                  {train.section}
                </td>

                <td className="py-2.5 px-2 text-center">
                  <span className={`font-bold ${
                    train.delayMin > 5 ? 'text-[#E8731A]' : train.delayMin > 0 ? 'text-amber-600' : 'text-[#1E8A3C]'
                  }`}>
                    {train.delayMin > 0 ? `+${train.delayMin}m` : '0m'}
                  </span>
                </td>

                <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px]">
                  {train.disruption}
                </td>

                <td className="py-2.5 px-2 text-center text-slate-700 font-bold">
                  {train.rangeWidth}
                </td>

                <td className="py-2.5 px-2 text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-semibold uppercase tracking-wider ${
                    train.delayMin > 5
                      ? 'bg-amber-100 text-[#E8731A]'
                      : train.delayMin > 0
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-[#1E8A3C]'
                  }`}>
                    {train.delayMin > 5 ? 'Disrupted' : train.delayMin > 0 ? 'Monitoring' : 'Normal'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alerts List */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          <BellRing className="w-3.5 h-3.5 text-[#E8731A]" />
          <span>Active Operational Alerts</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50/60 border border-amber-200/60 text-slate-700">
            <AlertTriangle className="w-3.5 h-3.5 text-[#E8731A] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              <strong className="text-slate-800">Cascade Alert: </strong>
              <span>
                {activeTrainNumber} · section {activeSection}: a delayed preceding train adds 0.4× its delay (assumed rule, simulated input).
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <Radio className="w-3.5 h-3.5 text-[#12386B] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              <strong className="text-slate-800">Cadence Notice: </strong>
              <span>30 s is the target cadence for a production RTIS feed. This prototype has no live feed (simulated).</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
