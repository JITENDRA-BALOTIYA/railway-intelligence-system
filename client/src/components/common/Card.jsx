export const Card = ({
  children,
  className = '',
  hover = false,
  glow = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs ${
        hover ? 'modern-card-hover cursor-pointer' : ''
      } ${
        glow ? 'border-emerald-500/40 ring-1 ring-emerald-500/10' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
