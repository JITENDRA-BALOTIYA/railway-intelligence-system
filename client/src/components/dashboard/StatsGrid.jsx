import { TrainFront, CheckCircle2, Clock, Activity } from 'lucide-react'
import { StatWidget } from '../common/StatWidget.jsx'

export const StatsGrid = ({ overview }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatWidget
        title="Tracked Trains"
        value={overview?.trackedTrains || 12458}
        unit="active"
        change="+14% vs yesterday"
        trend="up"
        icon={TrainFront}
        colorTone="emerald"
        description="Across all zonal grids"
      />
      <StatWidget
        title="On-Time Punctuality"
        value={`${overview?.onTimePercentage || 84.2}%`}
        change="+2.4% this week"
        trend="up"
        icon={CheckCircle2}
        colorTone="blue"
        description="Target KPI: 80%+"
      />
      <StatWidget
        title="Delayed Trains"
        value={overview?.delayedTrains || 1842}
        unit="trains"
        change="-5% delay reduction"
        trend="up"
        icon={Clock}
        colorTone="amber"
        description="Avg duration 17 min"
      />
      <StatWidget
        title="Network Throughput"
        value={overview?.systemHealthScore ? `${overview.systemHealthScore}%` : '96.5%'}
        change="Optimal bandwidth"
        trend="up"
        icon={Activity}
        colorTone="purple"
        description="Corridor signal efficiency"
      />
    </div>
  )
}
