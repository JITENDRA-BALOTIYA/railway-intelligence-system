import { AlertBanner } from './AlertBanner.jsx'
import { EmptyState } from '../common/EmptyState.jsx'
import { Bell } from 'lucide-react'

export const AlertList = ({ alerts = [] }) => {
  if (!alerts.length) {
    return (
      <EmptyState
        icon={Bell}
        title="No Active Advisories"
        description="All railway zones are operating within nominal parameters."
      />
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <AlertBanner key={idx} alert={alert} />
      ))}
    </div>
  )
}
