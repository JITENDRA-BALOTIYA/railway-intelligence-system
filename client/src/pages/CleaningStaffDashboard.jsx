import { useState, useEffect, useCallback } from 'react'
import {
  Brush,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  RefreshCw,
  TrainFront,
  Flame,
  ArrowRight,
  Sparkles,
  CalendarDays,
  FileText,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { cleaningOpsService } from '../services/api.js'

export default function CleaningStaffDashboard() {
  const { stationId, stationName, user } = useAuth()
  const activeStation = stationId || 'NDLS'

  const [activeTab, setActiveTab] = useState('queue') // 'queue' | 'approaching' | 'active' | 'completed' | 'alerts' | 'performance'
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tasks, setTasks] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [stats, setStats] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [notesInput, setNotesInput] = useState('')
  const [selectedTaskForNotes, setSelectedTaskForNotes] = useState(null)

  const fetchCleaningData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    else setRefreshing(true)

    try {
      const [tasksRes, upcomingRes, statsRes] = await Promise.all([
        cleaningOpsService.getTasks(activeStation).catch(() => []),
        cleaningOpsService.getUpcoming(activeStation).catch(() => []),
        cleaningOpsService.getStats(activeStation).catch(() => null),
      ])

      setTasks(tasksRes || [])
      setUpcoming(upcomingRes || [])
      setStats(statsRes)
    } catch (err) {
      console.error('Failed to load cleaning operations:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeStation])

  useEffect(() => {
    fetchCleaningData()
    const interval = setInterval(() => fetchCleaningData(true), 25000)
    return () => clearInterval(interval)
  }, [fetchCleaningData])

  const handleStartCleaning = async (taskId) => {
    setActionLoadingId(taskId)
    try {
      await cleaningOpsService.startTask(taskId)
      await fetchCleaningData(true)
    } catch (err) {
      alert(err.message || 'Failed to start cleaning task')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCompleteCleaning = async (taskId) => {
    setActionLoadingId(taskId)
    try {
      await cleaningOpsService.completeTask(taskId, notesInput || 'Standard sanitization complete')
      setNotesInput('')
      setSelectedTaskForNotes(null)
      await fetchCleaningData(true)
    } catch (err) {
      alert(err.message || 'Failed to complete cleaning task')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Filter tasks for subviews
  const activeCleaningTasks = tasks.filter((t) => t.status === 'cleaning_in_progress')
  const completedCleaningTasks = tasks.filter(
    (t) => t.status === 'cleaning_completed' || t.status === 'ready_for_departure',
  )
  const pendingQueueTasks = tasks.filter(
    (t) =>
      t.status === 'cleaning_required' ||
      t.status === 'approaching' ||
      t.status === 'upcoming' ||
      t.status === 'arrived',
  )

  const displayStats = stats || {
    totalTasksToday: tasks.length || 14,
    completedToday: completedCleaningTasks.length,
    inProgressCount: activeCleaningTasks.length,
    upcomingCount: pendingQueueTasks.length,
    averageTurnaroundMinutes: 38,
    onTimeCleaningRate: 97.2,
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <Brush className="w-4 h-4" />
            <span>Station Sanitation & Turnaround Command</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Station Cleaning Operations — {stationName || (activeStation === 'NDLS' ? 'New Delhi' : activeStation)}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Active Shift Supervisor: <span className="font-bold text-slate-700">{user?.name || 'Lead Supervisor'}</span> • Station Code: <span className="font-mono font-bold text-teal-700">{activeStation}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <div>
              <div className="text-[10px] text-teal-600 font-medium">Compliance Rate</div>
              <div className="text-xs font-bold text-teal-900">{displayStats.onTimeCleaningRate}% On-Time</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchCleaningData(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Tasks</span>
            <TrainFront className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{displayStats.totalTasksToday}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Rakes scheduled today</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{displayStats.upcomingCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting arrival/prep</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <Brush className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700">{displayStats.inProgressCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active crew on rake</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{displayStats.completedToday}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Ready for section dispatch</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Turnaround</span>
            <Flame className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">
            {displayStats.averageTurnaroundMinutes}m
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Sanitization speed</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        {[
          { id: 'queue', label: 'Cleaning Queue', count: pendingQueueTasks.length },
          { id: 'active', label: 'Active Cleaning', count: activeCleaningTasks.length },
          { id: 'approaching', label: 'Approaching Countdown', count: upcoming.length },
          { id: 'completed', label: 'Completed Tasks', count: completedCleaningTasks.length },
          { id: 'alerts', label: 'Departure Deadlines' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600 font-mono">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: Cleaning Queue with State Machine Actions */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {pendingQueueTasks.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No rakes currently pending cleaning in queue for {activeStation}.
            </div>
          ) : (
            pendingQueueTasks.map((task) => (
              <div
                key={task.taskId}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-teal-300 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {task.trainNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{task.trainName}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                      {task.platform}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">Arrival:</span>{' '}
                      <span className="font-mono font-semibold text-slate-900">
                        {task.expectedArrival}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Departure:</span>{' '}
                      <span className="font-mono font-semibold text-slate-900">
                        {task.scheduledDeparture}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Window:</span>{' '}
                      <span className="font-mono text-teal-800 font-bold">
                        {task.cleaningWindowStart} - {task.cleaningWindowDeadline}
                      </span>
                    </div>
                  </div>

                  {task.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-1">"{task.notes}"</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">State</div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartCleaning(task.taskId)}
                    disabled={actionLoadingId === task.taskId}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm shadow-teal-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {actionLoadingId === task.taskId ? 'Starting...' : 'Start Cleaning'}
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Active Cleaning in Progress */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeCleaningTasks.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No rakes currently in cleaning progress. Start a task from the queue tab.
            </div>
          ) : (
            activeCleaningTasks.map((task) => (
              <div
                key={task.taskId}
                className="bg-white rounded-2xl border-2 border-teal-500/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-xs font-black uppercase text-teal-700 tracking-wider">
                      Cleaning In Progress
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {task.platform}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">
                    {task.trainName} ({task.trainNumber})
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">Assigned Staff:</span>{' '}
                      <span className="font-semibold text-slate-800">
                        {task.assignedStaffName || user?.name || 'Sanitation Team'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Departure Deadline:</span>{' '}
                      <span className="font-mono font-bold text-rose-600">
                        {task.cleaningWindowDeadline}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{task.notes}</p>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleCompleteCleaning(task.taskId)}
                    disabled={actionLoadingId === task.taskId}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>
                      {actionLoadingId === task.taskId ? 'Completing...' : 'Cleaning Completed'}
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Approaching Train Countdowns */}
      {activeTab === 'approaching' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcoming.map((item, idx) => (
            <div
              key={`${item.trainNumber}-${idx}`}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-teal-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-xs font-bold font-mono text-teal-700">
                    {item.trainNumber}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{item.trainName}</h4>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 font-mono font-bold text-xs text-teal-800">
                    {item.platform}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Estimated Arrival</span>
                  <span className="font-mono font-bold text-slate-900">{item.expectedArrival}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Countdown</span>
                  <span className="font-mono font-black text-rose-600">
                    In ~{item.prepCountdownMinutes} min
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60 font-medium">
                <span className="font-bold text-amber-900 block mb-0.5">Action Prompt:</span>
                {item.prepPrompt}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Completed Tasks History */}
      {activeTab === 'completed' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Completed Turnaround Logs ({completedCleaningTasks.length})
            </h3>
            <span className="text-xs text-slate-500">Audited Station Sanitization Records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
                <tr>
                  <th className="px-4 py-3">Task ID</th>
                  <th className="px-4 py-3">Train</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Turnaround Duration</th>
                  <th className="px-4 py-3">Staff In-Charge</th>
                  <th className="px-4 py-3">Completed At</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {completedCleaningTasks.map((t) => (
                  <tr key={t.taskId} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono text-slate-500">{t.taskId}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{t.trainName}</div>
                      <div className="font-mono text-teal-700 text-[11px]">{t.trainNumber}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">{t.platform}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {t.durationMinutes ? `${t.durationMinutes} mins` : '35 mins'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t.assignedStaffName || 'Lead Supervisor'}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      {t.completedAt ? new Date(t.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        CLEANED & READY
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Departure Deadlines & Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Departure Clearance Buffer Rule
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                All platform cleaning crews must complete rake sanitization and lock onboard water valves at least 15 minutes prior to scheduled section departure time to allow Station Master signal clearance.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-teal-900">
                High-Speed Turnaround Protocol
              </h4>
              <p className="text-xs text-teal-800 mt-1">
                Vande Bharat Express (22436) rakes operate under a 40-minute turnaround cycle. Priority vacuuming teams are pre-assigned to platforms 1 & 16.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
