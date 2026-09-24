import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Loader2, Shield } from 'lucide-react'

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center animate-pulse">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <Loader2 className="w-20 h-20 text-indigo-500 animate-spin absolute -inset-2 opacity-50" />
        </div>
        <p className="mt-6 text-sm font-medium text-slate-400 tracking-wide">
          Verifying session...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children ? children : <Outlet />
}

export default ProtectedRoute
