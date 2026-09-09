import { TrainFront } from 'lucide-react'

export const Loader = ({ message = 'Loading railway telemetry data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 animate-pulse shadow-xs">
          <TrainFront className="w-7 h-7" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-emerald-500/30 border-t-emerald-600 animate-spin" />
      </div>
      <p className="text-xs font-bold text-slate-700 animate-pulse">{message}</p>
    </div>
  )
}
