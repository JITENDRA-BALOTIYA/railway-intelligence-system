import { AlertTriangle, ShieldAlert, Info, X } from 'lucide-react'

export const AlertBanner = ({ alert, onDismiss }) => {
  if (!alert) return null

  const styles = {
    critical: 'bg-rose-50 border-rose-200 text-rose-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    emergency: 'bg-rose-100 border-rose-300 text-rose-950',
  }

  const icons = {
    critical: ShieldAlert,
    warning: AlertTriangle,
    info: Info,
    emergency: ShieldAlert,
  }

  const Icon = icons[alert.severity] || Info
  const style = styles[alert.severity] || styles.info

  return (
    <div className={`p-4 rounded-2xl border ${style} flex items-start gap-3.5 shadow-xs`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold leading-tight">{alert.title}</div>
        <p className="text-[11px] opacity-90 mt-1 leading-relaxed">{alert.message}</p>
        {alert.zone && (
          <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border border-current opacity-70 bg-white/60">
            {alert.zone} Division
          </span>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-black/5 rounded-lg transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
