import { useState } from 'react'
import { Bell, AlertTriangle, ShieldAlert, Info, ChevronRight, X } from 'lucide-react'
import { useNotificationContext } from '../../context/NotificationContext.jsx'

export const AlertTicker = () => {
  const { alerts, activeTickerIndex } = useNotificationContext()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !alerts || alerts.length === 0) return null

  const currentAlert = alerts[activeTickerIndex % alerts.length] || alerts[0]

  const severityStyles = {
    critical: 'bg-rose-50 border-rose-200 text-rose-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    emergency: 'bg-rose-100 border-rose-300 text-rose-900',
  }

  const iconMap = {
    critical: ShieldAlert,
    warning: AlertTriangle,
    info: Info,
    emergency: ShieldAlert,
  }

  const IconComponent = iconMap[currentAlert?.severity] || Info
  const currentStyle = severityStyles[currentAlert?.severity] || severityStyles.info

  return (
    <div className={`px-4 py-2 border-b flex items-center justify-between text-xs transition-colors duration-500 ${currentStyle}`}>
      <div className="flex items-center gap-2 overflow-hidden">
        <IconComponent className="w-3.5 h-3.5 shrink-0" />
        <span className="font-bold shrink-0 uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-white/80 border border-current/20">
          {currentAlert?.severity || 'Advisory'}
        </span>
        <span className="font-semibold truncate">{currentAlert?.title}</span>
        <span className="hidden md:inline text-slate-600 truncate">— {currentAlert?.message}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-4">
        {currentAlert?.zone && (
          <span className="text-[10px] font-medium opacity-80 hidden lg:inline">
            Zone: {currentAlert.zone}
          </span>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-black/5 rounded-md transition-colors cursor-pointer"
          title="Dismiss Ticker"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
