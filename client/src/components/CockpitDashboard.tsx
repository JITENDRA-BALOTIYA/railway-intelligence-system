import React from 'react';
import { PredictedArrivalHero, StationNode } from './PredictedArrivalHero';
import { NetworkConditionsPanel } from './NetworkConditionsPanel';
import { DownstreamForecastTable } from './DownstreamForecastTable';
import { RecalculationLog } from './RecalculationLog';
import { TrainServiceProfile } from '../data/trainServices';
import { NetworkConditions, LogEntry } from '../types';
import { PredictionResult, RouteStationWithPrediction } from '../utils/prediction';

interface CockpitDashboardProps {
  selectedTrain: TrainServiceProfile;
  heroPrediction: PredictionResult;
  trainPositionPercent: number;
  heroStations: StationNode[];
  conditions: NetworkConditions;
  onToggleCondition: (key: keyof NetworkConditions) => void;
  onInjectUnscheduled: () => void;
  onStartProof: () => void;
  isProofRunning: boolean;
  routeStationsWithPrediction: RouteStationWithPrediction[];
  logs: LogEntry[];
  currentStopName: string;
  currentDelay: number;
  typicalDelay: number;
  onCurrentDelayChange: (v: number) => void;
  onPickPosition: (index: number) => void;
  coveragePct?: number;
}

export const CockpitDashboard: React.FC<CockpitDashboardProps> = ({
  selectedTrain,
  heroPrediction,
  trainPositionPercent,
  heroStations,
  conditions,
  onToggleCondition,
  onInjectUnscheduled,
  onStartProof,
  isProofRunning,
  routeStationsWithPrediction,
  logs,
  currentStopName,
  currentDelay,
  typicalDelay,
  onCurrentDelayChange,
  onPickPosition,
  coveragePct,
}) => {
  return (
    <div className="space-y-4">
      {/* Hero Row: Predicted Arrival Card (Left 8) & Network Conditions Panel (Right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 8 cols: Predicted Arrival Hero */}
        <div className="lg:col-span-8 flex flex-col">
          <PredictedArrivalHero
            trainNumber={selectedTrain.number}
            trainName={selectedTrain.name}
            trainCategory={selectedTrain.category}
            trainRoute={selectedTrain.route}
            heroStationCode={selectedTrain.heroStationCode}
            heroStationName={selectedTrain.heroStationName}
            activeSection={selectedTrain.activeSection}
            prediction={heroPrediction}
            currentStopName={currentStopName}
            currentDelay={currentDelay}
            onPickPosition={onPickPosition}
            coveragePct={coveragePct}
            trainPositionPercent={trainPositionPercent}
            stations={heroStations}
          />
        </div>

        {/* Right 4 cols: Network Conditions Interactive Panel */}
        <div className="lg:col-span-4 flex flex-col">
          <NetworkConditionsPanel
            conditions={conditions}
            onToggleCondition={onToggleCondition}
            onInjectUnscheduled={onInjectUnscheduled}
            onStartProof={onStartProof}
            isProofRunning={isProofRunning}
            currentStopName={currentStopName}
            currentDelay={currentDelay}
            typicalDelay={typicalDelay}
            onCurrentDelayChange={onCurrentDelayChange}
          />
        </div>
      </div>

      {/* Bottom Diagnostics Row - PERFECTLY ALIGNED with top row (8 cols + 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 8 cols: Station-by-station recalculation table */}
        <div className="lg:col-span-8 flex flex-col">
          <DownstreamForecastTable
            stations={routeStationsWithPrediction.map((st) => ({
              code: st.code,
              name: st.name,
              scheduledTime: st.scheduledTime,
              predictedTime: st.predictedTime,
              windowText: st.windowText,
              stateText: st.stateText,
              delayMin: st.delayMin,
            }))}
          />
        </div>

        {/* Right 4 cols: Prediction Engine Activity (RecalculationLog) - Perfectly Aligned */}
        <div className="lg:col-span-4 flex flex-col">
          <RecalculationLog logs={logs} activeTrainNumber={selectedTrain.number} />
        </div>
      </div>
    </div>
  );
};
