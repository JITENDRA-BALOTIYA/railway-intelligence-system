import { useState } from 'react'
import { useStationCrowd } from '../hooks/useStationCrowd.js'
import { StationCrowdCard } from '../components/stations/StationCrowdCard.jsx'
import { PlatformAvailability } from '../components/stations/PlatformAvailability.jsx'
import { Loader } from '../components/common/Loader.jsx'
import { MapPin, Users } from 'lucide-react'

const StationCrowd = () => {
  const [activeStation, setActiveStation] = useState('NDLS')
  const { stationData, allStations, loading } = useStationCrowd(activeStation)

  if (loading) return <Loader message="Loading station crowd intelligence..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Station Crowd Intelligence</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Platform density, crowd patterns, and terminal capacity analytics
          </p>
        </div>
      </div>

      {/* Station Selector Chips */}
      <div className="flex flex-wrap gap-2">
        {allStations.map((s) => (
          <button
            key={s.stationCode}
            onClick={() => setActiveStation(s.stationCode)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              activeStation === s.stationCode
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            {s.stationCode} - {s.city}
          </button>
        ))}
      </div>

      {stationData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StationCrowdCard stationData={stationData} />
          <PlatformAvailability platforms={stationData.platforms || []} />
        </div>
      )}

      {/* Peak Hours Info */}
      {stationData?.peakHours && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Terminal Peak Hours</h3>
          <div className="flex flex-wrap gap-2">
            {stationData.peakHours.map((ph, idx) => (
              <span
                key={idx}
                className="text-xs px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold"
              >
                {ph}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default StationCrowd
