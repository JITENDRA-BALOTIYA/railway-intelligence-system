import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl border border-slate-800">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
