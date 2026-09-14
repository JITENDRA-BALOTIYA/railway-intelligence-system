import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  TrainFront,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  Shield,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronRight,
  LogIn,
  UserPlus,
  Cpu,
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
  const [showPassword, setShowPassword] = useState(false)
  const [rememberTerminal, setRememberTerminal] = useState(true)
  const [name, setName] = useState('')
  const [role, setRole] = useState('super_admin')
  const [stationId, setStationId] = useState('NDLS')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [infoMsg, setInfoMsg] = useState('')
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
    setInfoMsg('')
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

  const demoAccounts = [
    {
      role: 'super_admin',
      title: 'Super Admin',
      badge: 'Full Access',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      subtitle: 'Full System (12 Modules)',
      email: 'admin@railway.gov.in',
      password: 'Admin@123',
    },
    {
      role: 'station_master',
      title: 'Station Master',
      badge: 'NDLS',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      subtitle: 'NDLS (Arrivals & Platforms)',
      email: 'sm.ndls@railway.gov.in',
      password: 'Station@123',
    },
    {
      role: 'cleaning_staff',
      title: 'Cleaning & Yard Staff',
      badge: 'Turnaround',
      badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      subtitle: 'NDLS (Tasks & Workflow)',
      email: 'clean.ndls@railway.gov.in',
      password: 'Clean@123',
    },
    {
      role: 'public_user',
      title: 'Public Passenger',
      badge: 'Public ETA',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      subtitle: 'Live Search & Tracking',
      email: 'user@gmail.com',
      password: 'User@123',
    },
  ]

  const handleDemoClick = async (demo) => {
    setEmail(demo.email)
    setPassword(demo.password)
    setErrorMsg('')
    setInfoMsg('')
    setSubmitting(true)

    try {
      const user = await login(demo.email, demo.password)
      navigate(getRedirectPath(user.role), { replace: true })
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAutoFill = () => {
    const adminDemo = demoAccounts[0]
    setEmail(adminDemo.email)
    setPassword(adminDemo.password)
    setInfoMsg(`Autofilled credentials for ${adminDemo.title}. Click "Sign In to Operations Portal" to proceed.`)
    setErrorMsg('')
  }

  const handleSmartCardLogin = () => {
    setErrorMsg('')
    setInfoMsg('Connecting to RailGov PIV / CAC smart card reader... Please ensure your PKI hardware token is plugged in.')
  }

  const handleForgotCredentials = (e) => {
    e.preventDefault()
    setInfoMsg('To recover or reset your NOC credentials, please contact your Divisional Railway Administrator or email support@railway.gov.in.')
  }

  const filteredStations = STATIONS.filter(
    (s) =>
      s.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(stationSearch.toLowerCase()),
  )

  const isStationRole = role === 'station_master' || role === 'cleaning_staff'

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-x-hidden select-none"
      style={{
        backgroundColor: '#f7faf8',
        backgroundImage: `
          radial-gradient(circle at 50% 15%, rgba(5, 150, 105, 0.08) 0%, transparent 65%),
          radial-gradient(circle at 50% 85%, rgba(13, 148, 136, 0.05) 0%, transparent 55%),
          linear-gradient(to right, rgba(226, 232, 240, 0.8) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(226, 232, 240, 0.8) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 32px 32px, 32px 32px',
      }}
    >
      {/* Subtle top bezel line matching application frame */}
      <div className="w-full h-1.5 bg-slate-300/80" />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col justify-center items-center py-6 sm:py-10 px-4 sm:px-6">
        {/* Top Header */}
        <div className="text-center max-w-xl mb-6">
          {/* Green Train Icon Box */}
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-emerald-600 mb-3">
            <TrainFront className="w-7 h-7 stroke-[2.2]" />
          </div>

          {/* Title with Version Badge */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-[32px] font-extrabold text-slate-900 tracking-tight font-sans">
              Railway Intelligence System
            </h1>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-700 bg-emerald-50/90 leading-tight">
              RIS-V4.2
            </span>
          </div>

          {/* Subtitle */}
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-normal">
            Smart Railway Operations &amp; ETA Intelligence Enterprise Platform
          </p>
        </div>

        {/* Login / Auth Card */}
        <div className="w-full max-w-[550px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/90 p-6 sm:p-8">
          {/* Segmented Tab Switcher */}
          <div className="bg-slate-100/90 p-1 rounded-xl flex items-center mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false)
                setErrorMsg('')
                setInfoMsg('')
              }}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LogIn className="w-4 h-4 text-emerald-600" />
              <span>Sign In to Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true)
                setErrorMsg('')
                setInfoMsg('')
              }}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isRegister
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4 text-slate-400" />
              <span>Register Personnel / SSO</span>
            </button>
          </div>

          {/* Alerts / Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  EMAIL / USER ID
                </label>
                <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  GOV / NOC ID ACCEPTED
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold select-none">
                  @
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@railway.gov.in"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={handleForgotCredentials}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  Forgot credentials?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Registration Extra Fields */}
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select User Role
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="super_admin">Super Admin (Full Network Operations)</option>
                    <option value="station_master">Station Master (Station-Scoped Operations)</option>
                    <option value="cleaning_staff">Cleaning Staff (Sanitation & Turnaround)</option>
                    <option value="public_user">Public User (Passenger Portal)</option>
                  </select>
                </div>
              </div>
            )}

            {isRegister && isStationRole && (
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>Select Assigned Station</span>
                </div>
                <input
                  type="text"
                  placeholder="Filter station name or code..."
                  value={stationSearch}
                  onChange={(e) => setStationSearch(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-emerald-200 text-xs bg-white text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {filteredStations.map((stn) => (
                    <button
                      key={stn.code}
                      type="button"
                      onClick={() => setStationId(stn.code)}
                      className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        stationId === stn.code
                          ? 'border-emerald-600 bg-white shadow-xs font-bold text-emerald-800 ring-1 ring-emerald-500/20'
                          : 'border-emerald-100 bg-white/80 hover:bg-white text-slate-700'
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

            {/* Checkbox and Token Status Row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberTerminal}
                  onChange={(e) => setRememberTerminal(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Remember active terminal
                </span>
              </label>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hardware Token OK</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>
                    {isRegister ? 'Complete Personnel Registration' : 'Sign In to Operations Portal'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Instant Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INSTANT DEMO LOGINS (1-CLICK TEST)</span>
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                className="text-[10px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
              >
                Auto Fill
              </button>
            </div>

            {/* 2x2 Demo Account Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleDemoClick(demo)}
                  disabled={submitting}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/20 text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 truncate">
                        {demo.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded leading-none shrink-0 ${demo.badgeClass}`}
                      >
                        {demo.badge}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    {demo.subtitle}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Card Footer: Government Smart Card user */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-500">Government Smart Card user?</span>
            <button
              type="button"
              onClick={handleSmartCardLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>Login via RailGov PIV / CAC</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Status Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white/80 backdrop-blur-xs py-3 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        {/* Left Security Status */}
        <div className="flex items-center gap-1.5 text-slate-600 flex-wrap justify-center sm:justify-start">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Protected by <strong className="text-slate-800 font-semibold">RailGov SecNet</strong></span>
          <span className="text-slate-300">•</span>
          <span>256-bit TLS Encrypted</span>
          <span className="text-slate-300">•</span>
          <span>24/7 Operations NOC</span>
        </div>

        {/* Right Policy & System ID */}
        <div className="flex items-center gap-4 text-slate-500 flex-wrap justify-center sm:justify-end">
          <button
            type="button"
            onClick={() => setInfoMsg('Official Railway Intelligence Security Protocol: ISO/IEC 27001 Certified & CERT-In Compliant.')}
            className="hover:text-slate-800 transition-colors cursor-pointer"
          >
            Security Policy
          </button>
          <button
            type="button"
            onClick={() => setInfoMsg('All 12 Rail Network Intelligence Subsystems are operational: 99.98% uptime.')}
            className="hover:text-slate-800 transition-colors cursor-pointer"
          >
            Platform Status
          </button>
          <button
            type="button"
            onClick={() => setInfoMsg('Railway Operations Helpdesk: Internal VoIP 4001 or support@railway.gov.in.')}
            className="hover:text-slate-800 transition-colors cursor-pointer"
          >
            Helpdesk Support
          </button>
          <span className="text-slate-400 font-mono text-[11px]">
            RIS-SYS: 4.2.1-PROD
          </span>
        </div>
      </footer>
    </div>
  )
}
