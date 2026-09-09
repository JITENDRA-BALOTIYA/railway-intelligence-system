import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { ShieldAlert, Loader2 } from 'lucide-react'

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-semibold text-slate-600">Verifying session credentials...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Map authorized default dashboard path per role
    const defaultPaths = {
      super_admin: '/',
      station_master: '/station-master/dashboard',
      cleaning_staff: '/cleaning/dashboard',
      public_user: '/user/dashboard',
    }
    const targetPath = defaultPaths[role] || '/'

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Access Restricted</h2>
        <p className="text-sm text-slate-600 max-w-md mb-6">
          Your account role (<span className="font-semibold text-slate-900">{role.replace('_', ' ').toUpperCase()}</span>)
          does not have permission to view this command surface.
        </p>
        <Navigate to={targetPath} replace />
      </div>
    )
  }

  return children ? children : null
}
