import { useState, useEffect } from 'react'
import { Search, Bell, ChevronDown, Clock, Radio, TrainFront } from 'lucide-react'
import { useTrain } from '../../context/TrainContext.jsx'
import { useNavigate } from 'react-router-dom'

export const Header = () => {
  const { selectedTrain, refreshTrain, isRefreshing } = useTrain()
  const [localSearch, setLocalSearch] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
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

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between gap-6 shrink-0 z-20">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter train number (e.g. 12301, 12951, 12002)..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs font-mono"
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
          <span>Try:</span>
          {['12301', '12951', '12002', '22221'].map((tag, idx) => (
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

      {/* Right Side Header Items */}
      <div className="flex items-center gap-5">
        {/* Live Data Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Data</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            JB
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">Jitendra Balotiya</div>
            <div className="text-[10px] font-medium text-emerald-600 leading-tight">Premium User</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
        </div>

        {/* Live Clock & Quote Card on Right */}
        <div className="hidden xl:flex flex-col items-end pl-3 border-l border-slate-200 text-right">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{formattedTime}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">{formattedDate}</div>
          <div className="text-[10px] text-emerald-700 italic font-medium mt-0.5">
            "Connecting People, Uniting India"
          </div>
        </div>
      </div>
    </header>
  )
}
