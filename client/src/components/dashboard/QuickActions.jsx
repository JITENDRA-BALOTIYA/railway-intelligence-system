import { Search, Map, TrendingUp, Users, Radio, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const QuickActions = () => {
  const navigate = useNavigate()

  const actions = [
    { label: 'Train Search & Directory', path: '/search', icon: Search, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Live GPS Tracking', path: '/tracking', icon: Radio, bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'AI ETA Forecast', path: '/eta', icon: TrendingUp, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { label: 'Corridor Congestion', path: '/congestion', icon: Map, bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Station Crowd Intelligence', path: '/stations', icon: Users, bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'Festival Rush Operations', path: '/festival-rush', icon: Sparkles, bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map((act) => (
        <button
          key={act.label}
          onClick={() => navigate(act.path)}
          className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-xs cursor-pointer ${act.bg}`}
        >
          <act.icon className="w-5 h-5 mb-2" />
          <span className="text-xs font-bold leading-snug">{act.label}</span>
        </button>
      ))}
    </div>
  )
}
