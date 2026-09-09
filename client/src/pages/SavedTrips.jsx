import { useState, useEffect } from 'react'
import { useSavedTrips } from '../hooks/useSavedTrips.js'
import { trainService } from '../services/trainService.js'
import { Card } from '../components/common/Card.jsx'
import { Badge } from '../components/common/Badge.jsx'
import { Loader } from '../components/common/Loader.jsx'
import { EmptyState } from '../components/common/EmptyState.jsx'
import { Bookmark, TrainFront, Trash2, ArrowRight, MapPin } from 'lucide-react'

const SavedTrips = () => {
  const { savedTrips, toggleSaveTrip } = useSavedTrips()
  const [trainDetails, setTrainDetails] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true)
        const details = await Promise.all(
          savedTrips.map((num) =>
            trainService.getTrainByNumber(num).catch(() => null),
          ),
        )
        setTrainDetails(details.filter(Boolean))
      } catch (e) {
        console.error('Failed to load saved trips:', e)
      } finally {
        setLoading(false)
      }
    }

    if (savedTrips.length > 0) {
      loadDetails()
    } else {
      setTrainDetails([])
      setLoading(false)
    }
  }, [savedTrips])

  if (loading) return <Loader message="Loading your saved trips..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Saved Trips & Bookmarks</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Quick-access bookmarks for your monitored trains ({savedTrips.length} saved)
        </p>
      </div>

      {trainDetails.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No Saved Trains Yet"
          description="Click the bookmark/heart icon on any train to monitor it quickly from here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainDetails.map((train) => (
            <Card key={train.trainNumber} hover className="relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                    <TrainFront className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{train.trainName}</div>
                    <div className="text-xs text-emerald-700 font-mono font-semibold">#{train.trainNumber}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={train.delay > 10 ? 'orange' : 'green'} size="sm">
                    {train.status}
                  </Badge>
                  <button
                    onClick={() => toggleSaveTrip(train.trainNumber)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{train.sourceCode || 'SRC'}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span>{train.destinationCode || 'DEST'}</span>
                <span className="ml-auto text-slate-600 font-bold font-mono">Speed: {train.speed} km/h</span>
              </div>

              {train.delay > 0 && (
                <div className="mt-2 text-[11px] font-bold text-amber-700">
                  +{train.delay} min delay
                  {train.currentStation && ` • Near ${train.currentStation.replace(/\(.*\)/, '').trim()}`}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedTrips
