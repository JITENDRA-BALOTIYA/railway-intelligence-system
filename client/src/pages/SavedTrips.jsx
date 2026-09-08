import { useState, useEffect } from 'react'
import { useSavedTrips } from '../hooks/useSavedTrips.js'
import { trainService } from '../services/trainService.js'
import { Card } from '../components/common/Card.jsx'
import { Badge } from '../components/common/Badge.jsx'
import { Loader } from '../components/common/Loader.jsx'
import { EmptyState } from '../components/common/EmptyState.jsx'
import { Bookmark, TrainFront, Trash2, ArrowRight, MapPin } from 'lucide-react'

const SavedTrips = () => {
  const { savedTrips, toggleSaveTrip, isSaved } = useSavedTrips()
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
        <h1 className="text-xl font-bold text-white">Saved Trips</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Quick-access bookmarks for your monitored trains ({savedTrips.length} saved)
        </p>
      </div>

      {trainDetails.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No Saved Trips"
          description="Search for trains and bookmark them for quick monitoring access."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainDetails.map((train) => (
            <Card key={train.trainNumber} hover className="relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <TrainFront className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{train.trainName}</div>
                    <div className="text-xs text-slate-400 font-mono">#{train.trainNumber}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={train.delay > 10 ? 'orange' : 'green'} size="sm">
                    {train.status}
                  </Badge>
                  <button
                    onClick={() => toggleSaveTrip(train.trainNumber)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                <MapPin className="w-3 h-3" />
                <span>{train.sourceCode}</span>
                <ArrowRight className="w-3 h-3" />
                <span>{train.destinationCode}</span>
                <span className="ml-auto text-slate-500">Speed: {train.speed} km/h</span>
              </div>

              {train.delay > 0 && (
                <div className="mt-2 text-[10px] text-amber-400">
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
