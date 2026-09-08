import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Radio,
  Clock,
  AlertTriangle,
  TrendingUp,
  Search,
  Network,
  Map,
  Activity,
  Users,
  Sparkles,
  Bookmark,
  TrainFront,
  Signal,
} from 'lucide-react'

const navGroups = [
  {
    group: null,
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    ],
  },
  {
    group: 'TRACKING & PREDICTION',
    items: [
      { name: 'Live Tracking', path: '/tracking', icon: Radio },
      { name: 'ETA Prediction', path: '/eta', icon: Clock },
      { name: 'Delay Reason', path: '/delays', icon: AlertTriangle },
      { name: 'Future Delay Risk', path: '/delay-risk', icon: TrendingUp },
      { name: 'Train Search', path: '/search', icon: Search },
    ],
  },
  {
    group: 'CORRIDOR & NETWORK',
    items: [
      { name: 'Route Analytics', path: '/analytics', icon: Network },
      { name: 'Congestion Map', path: '/congestion', icon: Map },
      { name: 'Performance', path: '/analytics', icon: Activity },
    ],
  },
  {
    group: 'PASSENGER & TERMINALS',
    items: [
      { name: 'Station Crowd', path: '/stations', icon: Users },
      { name: 'Festival Rush', path: '/festival-rush', icon: Sparkles, badge: 'NEW' },
      { name: 'Saved Trips', path: '/saved', icon: Bookmark },
    ],
  },
]

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-screen select-none">
      {/* Top Section: Logo + Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-none">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30 shrink-0">
            <TrainFront className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
              Railway Intelligence
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight truncate mt-0.5">
              AI-Powered ETA & Delay Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              {group.group && (
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2">
                  {group.group}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 font-bold border-l-4 border-emerald-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <item.icon
                            className={`w-4 h-4 transition-colors ${
                              isActive
                                ? 'text-emerald-600 stroke-[2.5]'
                                : 'text-slate-400 group-hover:text-slate-700'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">System Online</div>
              <div className="text-[10px] text-slate-500 font-medium">All Services Operational</div>
            </div>
          </div>
          <Signal className="w-4 h-4 text-emerald-600" />
        </div>
      </div>
    </aside>
  )
}
