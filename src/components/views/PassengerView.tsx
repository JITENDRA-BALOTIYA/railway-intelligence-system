import React from 'react';
import { Clock, MapPin, Info, Train, ShieldCheck } from 'lucide-react';
import { PredictionResult } from '../../utils/prediction';

interface PassengerViewProps {
  prediction: PredictionResult;
  stationName: string;
  stationCode: string;
  trainNumber?: string;
  trainName?: string;
  platform?: string;
}

export const PassengerView: React.FC<PassengerViewProps> = ({
  prediction,
  stationName,
  stationCode,
  trainNumber = '',
  trainName = '',
  platform = '—',
}) => {
  const isDelayed = prediction.isDelayed;

  return (
    <div className="flex flex-col items-center justify-center py-2">
      {/* Phone-style passenger view card */}
      <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-slate-200 shadow-md p-4 relative overflow-hidden">
        {/* Phone top speaker bar */}
        <div className="w-16 h-1 bg-slate-200 rounded-full mx-auto mb-3" />

        {/* Header inside phone */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#12386B] text-white flex items-center justify-center">
              <Train className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="font-bold text-xs text-[#12386B]">IRCTC Next-Stop Alert</div>
              <div className="text-[10px] text-slate-500 font-medium">{trainNumber} • {trainName}</div>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isDelayed ? 'bg-amber-100 text-[#E8731A]' : 'bg-emerald-100 text-[#1E8A3C]'
          }`}>
            {prediction.delayMinutes > 0 ? `+${prediction.delayMinutes}m` : 'On Time'}
          </span>
        </div>

        {/* Destination / Next Stop Info */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <MapPin className="w-3 h-3 text-[#E8731A]" />
            <span>Approaching Station</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#12386B] mt-0.5">
            {stationName} ({stationCode})
          </h3>
          <span className="text-[11px] font-medium text-slate-500">{platform === '—' ? 'Platform info not in public data' : `Platform ${platform} Expected`}</span>
        </div>

        {/* Hero Next-Station ETA */}
        <div className="my-4 py-3 px-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Expected Arrival Time
          </span>
          <div className="text-3xl font-black font-mono tracking-tight text-[#12386B] my-1">
            {prediction.predictedEta}
          </div>
          <div className="text-xs font-semibold text-slate-600">
            Scheduled: <span className="line-through text-slate-400">{prediction.scheduledEta}</span>
          </div>
        </div>

        {/* Range in Words */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950">
          <div className="flex items-center gap-1.5 font-bold text-[#E8731A] text-[11px] uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Range in words</span>
          </div>
          <p className="font-medium text-slate-800 leading-snug">
            {isDelayed
              ? `Expected between ${prediction.rangeLower} and ${prediction.rangeUpper} (most probable arrival: ${prediction.predictedEta}).`
              : `Arriving on schedule between ${prediction.rangeLower} and ${prediction.rangeUpper}.`}
          </p>
        </div>

        {/* Reason Line */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[#12386B] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight">
            <strong className="text-slate-800">Reason: </strong>
            <span>{prediction.reason}</span>
          </div>
        </div>

        {/* Passenger tips note */}
        <div className="mt-3 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#1E8A3C]" />
          <span>Forecast from the XGBoost model via the API · inputs simulated</span>
        </div>
      </div>
    </div>
  );
};
