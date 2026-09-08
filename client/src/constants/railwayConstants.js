export const NAV_SECTIONS = [
  {
    title: 'TRACKING & PREDICTION',
    items: [
      { label: 'Dashboard', path: '/', icon: 'Home' },
      { label: 'Live Tracking', path: '/tracking', icon: 'MapPinned' },
      { label: 'ETA Prediction', path: '/eta', icon: 'Clock3' },
      { label: 'Delay Reason', path: '/delays', icon: 'AlertTriangle' },
      { label: 'Future Delay Risk', path: '/delay-risk', icon: 'Gauge' },
      { label: 'Train Search', path: '/search', icon: 'Search' },
    ],
  },
  {
    title: 'CORRIDOR & NETWORK',
    items: [
      { label: 'Route Analytics', path: '/analytics', icon: 'Route' },
      { label: 'Congestion Map', path: '/congestion', icon: 'Map' },
    ],
  },
  {
    title: 'PASSENGER & TERMINALS',
    items: [
      { label: 'Station Crowd', path: '/stations', icon: 'Users' },
      { label: 'Saved Trips', path: '/saved', icon: 'Bookmark' },
    ],
  },
]

export const STATUS_COLORS = {
  Running: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'On Time': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Delayed: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
}
