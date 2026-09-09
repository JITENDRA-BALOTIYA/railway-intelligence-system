import { NavLink, useLocation } from 'react-router-dom'
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
  CheckCircle2,
  Brush,
  Building2,
  CalendarDays,
  Shield,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export const Sidebar = () => {
  const { user, role, stationId } = useAuth()
  const location = useLocation()

  // Define role-specific navigation menus
  const getNavGroups = () => {
    if (role === 'station_master') {
      return [
        {
          group: 'STATION OPERATIONS',
          items: [
            { name: 'Dashboard', path: '/station-master/dashboard', icon: LayoutDashboard },
            { name: "Today's Schedule", path: '/station-master/dashboard?tab=schedule', icon: CalendarDays },
            { name: 'Live Arrivals', path: '/station-master/dashboard?tab=arrivals', icon: Radio },
            { name: 'Live Departures', path: '/station-master/dashboard?tab=departures', icon: Clock },
            { name: 'Platform Status', path: '/station-master/dashboard?tab=platforms', icon: Building2 },
          ],
        },
        {
          group: 'INTELLIGENCE & ALERTS',
          items: [
            { name: 'Delay Analysis', path: '/station-master/dashboard?tab=delays', icon: AlertTriangle },
            { name: 'Station Crowd', path: '/stations', icon: Users },
            { name: 'Station Alerts', path: '/station-master/dashboard?tab=alerts', icon: TrendingUp },
            { name: 'Train Search', path: '/search', icon: Search },
          ],
        },
      ]
    }

    if (role === 'cleaning_staff') {
      return [
        {
          group: 'CLEANING OPERATIONS',
          items: [
            { name: 'Dashboard', path: '/cleaning/dashboard', icon: LayoutDashboard },
            { name: 'Upcoming Trains', path: '/cleaning/dashboard?tab=approaching', icon: Clock },
            { name: 'Cleaning Queue', path: '/cleaning/dashboard?tab=queue', icon: Brush },
            { name: 'Active Cleaning', path: '/cleaning/dashboard?tab=active', icon: Activity },
            { name: 'Completed Tasks', path: '/cleaning/dashboard?tab=completed', icon: CheckCircle2 },
          ],
        },
        {
          group: 'ALERTS & PERFORMANCE',
          items: [
            { name: 'Cleaning Alerts', path: '/cleaning/dashboard?tab=alerts', icon: AlertTriangle },
            { name: 'Performance', path: '/cleaning/dashboard?tab=performance', icon: TrendingUp },
          ],
        },
      ]
    }

    if (role === 'public_user') {
      return [
        {
          group: 'PASSENGER SERVICES',
          items: [
            { name: 'Search & Live Status', path: '/user/dashboard', icon: Search },
            { name: 'Live Train Map', path: '/tracking', icon: Radio },
            { name: 'Schedule Lookup', path: '/search', icon: CalendarDays },
            { name: 'My Saved Trips', path: '/saved', icon: Bookmark },
            { name: 'Station Crowd Flow', path: '/stations', icon: Users },
          ],
        },
      ]
    }

    // Super Admin: Full system visibility (preserved original 12 modules)
    return [
      {
        group: null,
        items: [{ name: 'Dashboard', path: '/', icon: LayoutDashboard }],
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
  }

  const navGroups = getNavGroups()

  const formatRoleBadge = () => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
      case 'station_master':
        return { label: `Station Master (${stationId || 'All'})`, color: 'bg-emerald-50 text-emerald-800 border-emerald-300' }
      case 'cleaning_staff':
        return { label: `Cleaning Staff (${stationId || 'All'})`, color: 'bg-teal-50 text-teal-800 border-teal-300' }
      case 'public_user':
        return { label: 'Public Passenger', color: 'bg-blue-50 text-blue-700 border-blue-200' }
      default:
        return { label: 'Guest', color: 'bg-slate-100 text-slate-700 border-slate-200' }
    }
  }

  const badgeInfo = formatRoleBadge()

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
              Smart Operations Platform
            </p>
          </div>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-2 mb-5">
          <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center justify-between ${badgeInfo.color}`}>
            <span className="truncate">{badgeInfo.label}</span>
            <Shield className="w-3.5 h-3.5 shrink-0 opacity-80 ml-1" />
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              {group.group && (
                <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-3 mb-2">
                  {group.group}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isCurrentActive =
                    item.path.includes('?')
                      ? `${location.pathname}${location.search}` === item.path
                      : location.pathname === item.path

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                          isCurrentActive
                            ? 'bg-emerald-50 text-emerald-700 font-bold border-l-4 border-emerald-600 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={`w-4 h-4 transition-colors ${
                            isCurrentActive
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
                    </NavLink>
                  )
                })}
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
              <div className="text-[10px] text-slate-500 font-medium">RailRadar Live Feed Active</div>
            </div>
          </div>
          <Signal className="w-4 h-4 text-emerald-600" />
        </div>
      </div>
    </aside>
  )
}
