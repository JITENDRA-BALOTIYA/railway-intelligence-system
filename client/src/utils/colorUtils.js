export const getDelayTone = (delay) => {
  const d = Number(delay) || 0
  if (d <= 5) return 'green'
  if (d <= 25) return 'orange'
  return 'red'
}

export const getConfidenceColor = (confidence) => {
  const c = Number(confidence) || 0
  if (c >= 85) return 'text-emerald-400'
  if (c >= 70) return 'text-amber-400'
  return 'text-rose-400'
}

export const getCrowdBadgeStyle = (level) => {
  switch (level?.toLowerCase()) {
    case 'low':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'moderate':
    case 'medium':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'high':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    case 'critical surge':
    case 'surge':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}
