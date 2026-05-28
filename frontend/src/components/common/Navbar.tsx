import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { Button } from '../ui'

export default function Navbar() {
  const { isAuthenticated, signOut, user } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          AI Clothing Exchange
        </Link>
        <nav className="flex items-center gap-3 text-sm text-slate-600">
          <Link to="/marketplace" className="hover:text-slate-900">
            Marketplace
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="hover:text-slate-900">
                {user?.username}
              </Link>
              <Button variant="secondary" onClick={signOut} type="button">
                Sign out
              </Button>
            </>
          ) : (
            <Link to="/login" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-900 transition hover:border-slate-300 hover:bg-slate-100">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
