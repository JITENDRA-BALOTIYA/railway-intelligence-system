import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar.jsx'
import { Header } from '../components/layout/Header.jsx'
import { AlertTicker } from '../components/layout/AlertTicker.jsx'

const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#f8fafc]">
        {/* Alert Ticker */}
        <AlertTicker />

        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
