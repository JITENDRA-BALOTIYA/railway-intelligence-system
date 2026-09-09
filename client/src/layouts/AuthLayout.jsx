import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
