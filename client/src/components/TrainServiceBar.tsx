import React from 'react';
import { TrainListItem, TrainServiceProfile } from '../data/trainServices';
import { TrainServiceDropdown } from './TrainServiceDropdown';
import { StatusChip } from './StatusChip';
import { Activity } from 'lucide-react';

interface TrainServiceBarProps {
  trains: TrainListItem[];
  selectedTrain: TrainServiceProfile;
  selectedTrainId: string;
  onSelectTrain: (trainId: string) => void;
  isProofRunning?: boolean;
}

export const TrainServiceBar: React.FC<TrainServiceBarProps> = ({
  trains,
  selectedTrain,
  selectedTrainId,
  onSelectTrain,
  isProofRunning = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
        <span className="text-slate-600 font-mono text-[11px] uppercase tracking-wider font-bold whitespace-nowrap">
          TRAIN SERVICE
        </span>

        {/* Custom Perfectly Aligned Dropdown */}
        <TrainServiceDropdown
          trains={trains}
          selectedTrainId={selectedTrainId}
          onSelectTrain={onSelectTrain}
        />

        <span className="hidden md:inline-block text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 whitespace-nowrap">
          {selectedTrain.category}
        </span>

        {/* Live Simulation Stepper Pill when proof is executing */}
        {isProofRunning && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500 text-white animate-pulse shadow-xs">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>8-SEC PROOF SIMULATION RUNNING</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-mono text-slate-600">
          TARGET CADENCE · <strong className="text-slate-800 font-bold">30 SEC</strong>
        </span>
        <StatusChip status="SIMULATED" label="SIMULATED RTIS" />
      </div>
    </div>
  );
};
