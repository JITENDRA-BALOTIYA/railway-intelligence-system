import { useState, useEffect, useRef } from 'react'
import {
  Search,
  Bell,
  ChevronDown,
  Clock,
  Radio,
  TrainFront,
  LogOut,
  UserCheck,
  Building2,
  Shield,
} from 'lucide-react'
import { useTrain } from '../../context/TrainContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

export const Header = () => {
  const { searchTrain } = useTrain()
  const { user, role, stationId, stationName, logout } = useAuth()
  const [localSearch, setLocalSearch] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const clean = localSearch.trim()
    if (clean) {
      navigate(`/search?train=${encodeURIComponent(clean)}`)
    }
  }

  const handleQuickTagClick = (trainNum) => {
    setLocalSearch(trainNum)
    navigate(`/search?train=${encodeURIComponent(trainNum)}`)
  }

  const handleLogout = () => {
    logout()
    setShowProfileMenu(false)
    navigate('/login')
  }

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  // Get user initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'OP'

  const getRoleLabel = () => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'station_master':
        return `Station Director (${stationId || 'NDLS'})`
      case 'cleaning_staff':
        return `Cleaning Supervisor (${stationId || 'NDLS'})`
      case 'public_user':
        return 'Public Passenger'
      default:
        return 'Authorized User'
    }
  }

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between gap-6 shrink-0 z-20">
      {/* Contextual Title / Search Bar */}
      <div className="flex-1 max-w-2xl">
        {role === 'station_master' ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {stationName || (stationId === 'NDLS' ? 'New Delhi Railway Station' : `${stationId} Station`)}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Station Operations Command & Live Train Clearance Hub
              </p>
            </div>
          </div>
        ) : role === 'cleaning_staff' ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <TrainFront className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Station Cleaning Operations — {stationName || stationId || 'NDLS'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Rake Turnaround, Sanitization Workflow & Departure Clearance
              </p>
            </div>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter train number (e.g. 12301, 12951, 12002)..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs font-mono"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                  title="Search Train"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium">
              <span>Quick Lookups:</span>
              {['12301', '12951', '12002', '22436'].map((tag, idx) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickTagClick(tag)}
                  className="text-slate-600 hover:text-emerald-700 transition-colors font-mono font-bold cursor-pointer"
                >
                  {tag}{idx < 3 ? ',' : ''}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Side Header Items */}
      <div className="flex items-center gap-5">
        {/* Live Data Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Data</span>
        </div>

        {/* User Profile with Functional Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-3 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {user?.name || 'Authorized User'}
              </div>
              <div className="text-[10px] font-medium text-emerald-600 leading-tight">
                {getRoleLabel()}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>{getRoleLabel()}</span>
                </div>
              </div>

              <div className="py-1 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false)
                    navigate('/login')
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Switch Account / Role</span>
                </button>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Clock & Date */}
        <div className="hidden xl:flex flex-col items-end pl-3 border-l border-slate-200 text-right">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{formattedTime}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">{formattedDate}</div>
        </div>
      </div>
    </header>
  )
}
