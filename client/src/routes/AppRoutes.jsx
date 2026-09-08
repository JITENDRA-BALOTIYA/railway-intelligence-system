import { Routes, Route } from 'react-router-dom'
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
import SavedTrips from '../pages/SavedTrips.jsx'

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="tracking" element={<LiveTracking />} />
        <Route path="eta" element={<ETAPrediction />} />
        <Route path="delays" element={<DelayAnalysis />} />
        <Route path="delay-risk" element={<FutureDelayRisk />} />
        <Route path="search" element={<TrainSearch />} />
        <Route path="analytics" element={<RouteAnalytics />} />
        <Route path="congestion" element={<CongestionMap />} />
        <Route path="stations" element={<StationCrowd />} />
        <Route path="saved" element={<SavedTrips />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
