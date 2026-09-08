export const StatusIndicator = ({
  status = 'online',
  label = '',
  pulse = true,
  size = 'md',
}) => {
  const colors = {
    online: 'bg-emerald-500 ring-emerald-500/30 text-emerald-400',
    warning: 'bg-amber-500 ring-amber-500/30 text-amber-400',
    critical: 'bg-rose-500 ring-rose-500/30 text-rose-400',
    delayed: 'bg-amber-500 ring-amber-500/30 text-amber-400',
    offline: 'bg-slate-500 ring-slate-500/30 text-slate-400',
  }

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }

  const style = colors[status.toLowerCase()] || colors.online

  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative flex">
        <span
          className={`${dotSizes[size] || dotSizes.md} rounded-full ${
            style.split(' ')[0]
          } ${pulse ? 'animate-signal' : ''}`}
        />
        {pulse && (
          <span
            className={`absolute -inset-1 rounded-full opacity-40 animate-ping ${
              style.split(' ')[0]
            }`}
          />
        )}
      </span>
      {label && <span className="text-xs font-medium text-slate-300">{label}</span>}
    </div>
  )
}
