import React from 'react';
import { Train, MapPin, Gauge, Radio, Clock } from 'lucide-react';
import { DisruptionType } from '../types';

interface StationItem {
  code: string;
  name: string;
  scheduledTime: string;
  predictedTime: string;
  delayMin: number;
  status: 'passed' | 'next' | 'downstream';
}

interface RouteStripProps {
  stations: StationItem[];
  currentDisruption: DisruptionType;
  trainSpeed: number;
  trainPositionPercent: number; // 0 to 100 on the route or active segment
}

export const RouteStrip: React.FC<RouteStripProps> = ({
  stations,
  currentDisruption,
  trainSpeed,
  trainPositionPercent,
}) => {
  const isDelayed = currentDisruption !== 'none';

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/90 p-3 sm:p-4 shadow-xs">
      {/* Top micro-bar: train info + real-time speed */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2.5 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#12386B] text-xs sm:text-sm tracking-tight">
            12951 • Mumbai Rajdhani Express
          </span>
          <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
            MMCT → NDLS Corridor
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] font-medium text-slate-600">
          <div className="flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
            <span>Speed:</span>
            <span className={`font-mono font-bold ${trainSpeed === 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {trainSpeed} km/h
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <Radio className="w-3 h-3 text-[#1E8A3C]" />
            <span className="hidden xs:inline">Section:</span>
            <strong className="text-slate-700">BRC–KOTA</strong>
          </div>

          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3" />
            <span>Ping: 8s ago</span>
          </div>
        </div>
      </div>

      {/* 5-Station Track Visualizer Container */}
      <div className="relative pt-6 pb-2 px-3 sm:px-6">
        {/* Dedicated Track Row */}
        <div className="relative h-7 flex items-center">
          {/* Base Track Line */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full" />

          {/* Active Completed Track Segment */}
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 h-1.5 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${trainPositionPercent}%`,
              backgroundColor: isDelayed ? '#E8731A' : '#12386B',
            }}
          />

          {/* Moving Train Marker Sitting on the Line */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-700 ease-out flex flex-col items-center"
            style={{ left: `${Math.min(88, Math.max(12, trainPositionPercent))}%` }}
          >
            {/* Live Indicator Tooltip */}
            <span className="absolute -top-6 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white shadow-xs tracking-wider">
              LIVE
            </span>
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md ring-2 ring-white transition-all ${
                isDelayed
                  ? 'bg-[#E8731A] text-white animate-bounce'
                  : 'bg-[#12386B] text-white'
              }`}
              title="Active Train GPS Location"
              aria-label="Active Train GPS Location"
            >
              <Train className="w-4 h-4" />
            </div>
          </div>

          {/* 5 Station Node Dots on the Track */}
          <div className="relative w-full flex justify-between items-center z-10">
            {stations.map((st) => {
              const isPassed = st.status === 'passed';
              const isNext = st.status === 'next';

              return (
                <div key={st.code} className="relative flex items-center justify-center">
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                      isPassed
                        ? 'bg-slate-400 border-slate-300'
                        : isNext
                        ? 'w-5 h-5 bg-[#12386B] border-amber-400 ring-4 ring-amber-100 shadow-sm'
                        : 'bg-white border-slate-400'
                    }`}
                  >
                    {isNext && <MapPin className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Station Labels Row Underneath */}
        <div className="w-full flex justify-between items-start mt-3">
          {stations.map((st) => {
            const isPassed = st.status === 'passed';
            const isNext = st.status === 'next';

            return (
              <div
                key={st.code}
                className="flex flex-col items-center text-center w-16 sm:w-20 group cursor-default"
              >
                {/* Station Code & Name */}
                <span
                  className={`font-mono text-xs font-bold leading-tight ${
                    isNext
                      ? 'text-[#12386B] underline decoration-[#E8731A] decoration-2 underline-offset-2'
                      : isPassed
                      ? 'text-slate-400'
                      : 'text-slate-700'
                  }`}
                >
                  {st.code}
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate max-w-full hidden sm:inline">
                  {st.name}
                </span>

                {/* Station Times */}
                <div className="mt-0.5 flex flex-col items-center text-[10px] font-mono leading-tight">
                  <span className="text-slate-400">
                    Sch {st.scheduledTime}
                  </span>
                  {isNext ? (
                    <span
                      className={`font-bold ${
                        st.delayMin > 0 ? 'text-[#E8731A]' : 'text-[#1E8A3C]'
                      }`}
                    >
                      Exp {st.predictedTime}
                    </span>
                  ) : !isPassed ? (
                    <span className={st.delayMin > 0 ? 'text-[#E8731A]' : 'text-slate-600'}>
                      Exp {st.predictedTime}
                    </span>
                  ) : (
                    <span className="text-slate-400">Passed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
