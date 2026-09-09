import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  TrainFront,
  Lock,
  Mail,
  User,
  Building2,
  Shield,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const STATIONS = [
  { code: 'NDLS', name: 'New Delhi Railway Station (NDLS)', city: 'New Delhi' },
  { code: 'MMCT', name: 'Mumbai Central (MMCT)', city: 'Mumbai' },
  { code: 'HWH', name: 'Howrah Junction (HWH)', city: 'Kolkata' },
  { code: 'JP', name: 'Jaipur Junction (JP)', city: 'Jaipur' },
  { code: 'KOTA', name: 'Kota Junction (KOTA)', city: 'Kota' },
  { code: 'CNB', name: 'Kanpur Central (CNB)', city: 'Kanpur' },
]

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('super_admin')
  const [stationId, setStationId] = useState('NDLS')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [stationSearch, setStationSearch] = useState('')

  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || null

  const getRedirectPath = (userRole) => {
    if (from && from !== '/login') return from
    switch (userRole) {
      case 'station_master':
        return '/station-master/dashboard'
      case 'cleaning_staff':
        return '/cleaning/dashboard'
      case 'public_user':
        return '/user/dashboard'
      case 'super_admin':
      default:
        return '/'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSubmitting(true)

    try {
      if (isRegister) {
        const selectedStationObj = STATIONS.find((s) => s.code === stationId)
        const user = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          stationId: role === 'station_master' || role === 'cleaning_staff' ? stationId : null,
          stationName: role === 'station_master' || role === 'cleaning_staff' ? selectedStationObj?.name : null,
        })
        navigate(getRedirectPath(user.role), { replace: true })
      } else {
        const user = await login(email.trim(), password)
        navigate(getRedirectPath(user.role), { replace: true })
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemoLogin = async (demoRole) => {
    setErrorMsg('')
    setSubmitting(true)

    const demoCreds = {
      super_admin: { email: 'admin@railway.gov.in', password: 'Admin@123' },
      station_master: { email: 'sm.ndls@railway.gov.in', password: 'Station@123' },
      cleaning_staff: { email: 'clean.ndls@railway.gov.in', password: 'Clean@123' },
      public_user: { email: 'user@gmail.com', password: 'User@123' },
    }

    const cred = demoCreds[demoRole]
    if (!cred) return

    try {
      const user = await login(cred.email, cred.password)
      navigate(getRedirectPath(user.role), { replace: true })
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredStations = STATIONS.filter(
    (s) =>
      s.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(stationSearch.toLowerCase()),
  )

  const isStationRole = role === 'station_master' || role === 'cleaning_staff'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 mb-4">
          <TrainFront className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Railway Intelligence System
        </h1>
        <p className="mt-2 text-sm text-emerald-200/90 font-medium">
          Smart Railway Operations & ETA Intelligence Platform
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-slate-100">
          {/* Form Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false)
                setErrorMsg('')
              }}
              className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors cursor-pointer ${
                !isRegister
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In to Dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true)
                setErrorMsg('')
              }}
              className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors cursor-pointer ${
                isRegister
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Register New User
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email / User ID
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@railway.gov.in"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select User Role
                </label>
                <div className="relative">
                  <Shield className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  >
                    <option value="super_admin">Super Admin (Full Network Operations)</option>
                    <option value="station_master">Station Master (Station-Scoped Operations)</option>
                    <option value="cleaning_staff">Cleaning Staff (Sanitation & Turnaround)</option>
                    <option value="public_user">Public User (Passenger Portal)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Conditional Station Selector */}
            {isRegister && isStationRole && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>Select Your Station (Server Scoped)</span>
                </div>
                <input
                  type="text"
                  placeholder="Filter station name or code..."
                  value={stationSearch}
                  onChange={(e) => setStationSearch(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-emerald-200 text-xs bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {filteredStations.map((stn) => (
                    <button
                      key={stn.code}
                      type="button"
                      onClick={() => setStationId(stn.code)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        stationId === stn.code
                          ? 'border-emerald-600 bg-white shadow-xs font-bold text-emerald-800 ring-2 ring-emerald-500/20'
                          : 'border-emerald-100 bg-white/70 hover:bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-700">{stn.code}</span>
                        {stationId === stn.code && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                      <div className="truncate text-[11px] text-slate-600 mt-0.5">{stn.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Complete Registration' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Instant Demo Logins (1-Click Test)</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('super_admin')}
                disabled={submitting}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-indigo-700 group-hover:text-indigo-800">
                  Super Admin
                </div>
                <div className="text-[10px] text-slate-500">Full System (12 Modules)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('station_master')}
                disabled={submitting}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  Station Master
                </div>
                <div className="text-[10px] text-slate-500">NDLS (Arrivals & Platforms)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('cleaning_staff')}
                disabled={submitting}
                className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-teal-700 group-hover:text-teal-800">
                  Cleaning Staff
                </div>
                <div className="text-[10px] text-slate-500">NDLS (Tasks & Workflow)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('public_user')}
                disabled={submitting}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-blue-700 group-hover:text-blue-800">
                  Public Passenger
                </div>
                <div className="text-[10px] text-slate-500">Live Search & Tracking</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
