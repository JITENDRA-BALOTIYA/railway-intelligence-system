import React from 'react';
import { CloudSun } from 'lucide-react';
import { StatusChip } from './StatusChip';
import { WeatherInfo } from '../types';

interface ProblemBannerProps {
  cityName: string;
  weather: WeatherInfo;
}

export const ProblemBanner: React.FC<ProblemBannerProps> = ({ cityName, weather }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 px-4 rounded-xl bg-white border border-slate-200/90 shadow-xs text-xs">
      <div className="flex items-center gap-2 text-slate-700">
        <span className="w-2 h-2 rounded-full bg-[#1E8A3C] animate-pulse shrink-0" />
        <span className="font-mono text-[#E8731A] font-bold tracking-wider">PS 26028 · THE PROBLEM</span>
        <span className="text-slate-800 font-semibold">
          Static ETAs stay fixed when real operations change.
        </span>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
          <CloudSun className="w-3.5 h-3.5 text-amber-500" />
          <span>{cityName} {weather.temp}°C</span>
        </div>
        <StatusChip status={weather.isLive ? 'LIVE' : 'SIMULATED'} label={weather.isLive ? 'LIVE' : 'CACHED'} />
      </div>
    </div>
  );
};
