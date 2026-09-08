import { TrainFront, Clock } from 'lucide-react'

export const PlatformAvailability = ({ platforms = [] }) => {
  if (!platforms || platforms.length === 0) return null

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Platform Occupancy & Berths
      </h3>

      <div className="space-y-2.5">
        {platforms.map((pf, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              pf.occupied
                ? 'bg-slate-50/80 border-slate-200'
                : 'bg-emerald-50/40 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold font-mono shadow-xs ${
                  pf.occupied
                    ? 'bg-slate-200 text-slate-800'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {pf.platformNumber}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {pf.occupied ? pf.trainName : 'Platform Available'}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium mt-0.5">
                  {pf.occupied && (
                    <>
                      <TrainFront className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono">#{pf.trainNumber}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  pf.occupied
                    ? 'text-slate-700 bg-slate-100 border-slate-300'
                    : 'text-emerald-700 bg-emerald-100 border-emerald-300'
                }`}
              >
                {pf.occupied ? 'Occupied' : 'Free Berth'}
              </span>
              {pf.expectedDeparture && (
                <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-end gap-1 font-medium">
                  <Clock className="w-3 h-3" />
                  Dep: {pf.expectedDeparture}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
