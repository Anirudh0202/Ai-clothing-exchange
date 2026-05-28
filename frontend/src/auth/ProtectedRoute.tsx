import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

interface ProtectedRouteProps {
  children: JSX.Element
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="p-8 text-center text-slate-700">Loading session…</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
