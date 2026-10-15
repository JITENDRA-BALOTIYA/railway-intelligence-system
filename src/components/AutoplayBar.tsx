import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export interface AutoplayStep {
  title: string;
  durationMs: number;
}

export const AUTOPLAY_STEPS: AutoplayStep[] = [
  { title: 'Train running on time', durationMs: 5000 },
  { title: 'Signal failure ahead', durationMs: 5000 },
  { title: 'ETA shifts, range widens, delay cascades to later stations', durationMs: 5000 },
  { title: 'Recovers, range narrows', durationMs: 5000 },
];

interface AutoplayBarProps {
  currentStepIndex: number;
  progressPercent: number; // 0 to 100 within current 20s story
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReplay: () => void;
  onSelectStep: (index: number) => void;
}

export const AutoplayBar: React.FC<AutoplayBarProps> = ({
  currentStepIndex,
  progressPercent,
  isPlaying,
  onTogglePlay,
  onReplay,
  onSelectStep,
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Caption & Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Play/Pause & Replay Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/70">
            <button
              onClick={onTogglePlay}
              className="p-1.5 rounded-md hover:bg-white text-slate-700 hover:text-[#12386B] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#12386B]"
              aria-label={isPlaying ? 'Pause 20-second story' : 'Play 20-second story'}
              title={isPlaying ? 'Pause Story' : 'Play Story'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={onReplay}
              className="p-1.5 rounded-md hover:bg-white text-slate-700 hover:text-[#12386B] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#12386B]"
              aria-label="Replay 20-second story"
              title="Replay 20-second story"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Current Step Caption */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#12386B] text-white text-[10px] font-bold shrink-0">
              {currentStepIndex + 1}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                20s Guided Scenario
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#12386B] truncate">
                {AUTOPLAY_STEPS[currentStepIndex].title}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Story Timeline Steps Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end overflow-x-auto pb-0.5">
          {AUTOPLAY_STEPS.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;

            return (
              <button
                key={idx}
                onClick={() => onSelectStep(idx)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Jump to step ${idx + 1}: ${step.title}`}
                className={`relative flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#12386B] ${
                  isActive
                    ? 'bg-[#12386B] text-white shadow-xs font-semibold'
                    : isCompleted
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
                title={`Step ${idx + 1}: ${step.title}`}
              >
                <span>Step {idx + 1}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8731A] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Bar Line */}
      <div
        className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Story autoplay progress"
      >
        <div
          className="h-full bg-gradient-to-r from-[#12386B] via-[#E8731A] to-[#1E8A3C] transition-all duration-200 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
