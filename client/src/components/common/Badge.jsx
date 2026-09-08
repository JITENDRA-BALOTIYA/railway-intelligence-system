export const Badge = ({
  children,
  variant = 'blue',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  const variantClasses = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    orange: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${
        sizeClasses[size] || sizeClasses.md
      } ${variantClasses[variant] || variantClasses.blue} ${className}`}
    >
      {children}
    </span>
  )
}
