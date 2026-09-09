import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import LiveTracking from '../pages/LiveTracking.jsx'
import ETAPrediction from '../pages/ETAPrediction.jsx'
import DelayAnalysis from '../pages/DelayAnalysis.jsx'
import FutureDelayRisk from '../pages/FutureDelayRisk.jsx'
import TrainSearch from '../pages/TrainSearch.jsx'
import RouteAnalytics from '../pages/RouteAnalytics.jsx'
import CongestionMap from '../pages/CongestionMap.jsx'
import StationCrowd from '../pages/StationCrowd.jsx'
import FestivalRush from '../pages/FestivalRush.jsx'
import SavedTrips from '../pages/SavedTrips.jsx'
import Login from '../pages/Login.jsx'
import StationMasterDashboard from '../pages/StationMasterDashboard.jsx'
import CleaningStaffDashboard from '../pages/CleaningStaffDashboard.jsx'
import PublicUserDashboard from '../pages/PublicUserDashboard.jsx'
import { ProtectedRoute } from '../components/auth/ProtectedRoute.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// Dynamic index component routing to appropriate role dashboard
const RoleHomeRouter = () => {
  const { role } = useAuth()
  switch (role) {
    case 'station_master':
      return <StationMasterDashboard />
    case 'cleaning_staff':
      return <CleaningStaffDashboard />
    case 'public_user':
      return <PublicUserDashboard />
    case 'super_admin':
    default:
      return <Dashboard />
  }
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated Dashboard Shell */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dynamic Home Route */}
        <Route index element={<RoleHomeRouter />} />

        {/* Dedicated Role Dashboard Endpoints */}
        <Route
          path="super-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="station-master/dashboard"
          element={
            <ProtectedRoute allowedRoles={['station_master', 'super_admin']}>
              <StationMasterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="cleaning/dashboard"
          element={
            <ProtectedRoute allowedRoles={['cleaning_staff', 'station_master', 'super_admin']}>
              <CleaningStaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="user/dashboard"
          element={
            <ProtectedRoute allowedRoles={['public_user', 'super_admin']}>
              <PublicUserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Existing Modules (Preserved for Super Admin & Authorized Operations) */}
        <Route path="tracking" element={<LiveTracking />} />
        <Route path="eta" element={<ETAPrediction />} />
        <Route path="delays" element={<DelayAnalysis />} />
        <Route path="delay-risk" element={<FutureDelayRisk />} />
        <Route path="search" element={<TrainSearch />} />
        <Route path="analytics" element={<RouteAnalytics />} />
        <Route path="congestion" element={<CongestionMap />} />
        <Route path="stations" element={<StationCrowd />} />
        <Route path="festival-rush" element={<FestivalRush />} />
        <Route path="saved" element={<SavedTrips />} />
      </Route>

      {/* Fallback Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
