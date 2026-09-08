export const formatMinutesToDisplay = (minutes) => {
  if (minutes === 0 || minutes === '0' || !minutes) return 'On Time'
  const num = Number(minutes)
  if (isNaN(num)) return minutes
  if (num < 0) return `${Math.abs(num)} min early`
  return `+${num} min`
}

export const formatSpeed = (speed) => {
  return `${speed || 0} km/h`
}

export const formatDistance = (km) => {
  if (!km) return '0 km'
  return `${Number(km).toLocaleString()} km`
}

export const formatPercentage = (val) => {
  return `${Math.round(val || 0)}%`
}
