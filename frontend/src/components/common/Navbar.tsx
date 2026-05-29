import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { Button } from '../ui'
import { AnimatePresence, motion } from 'framer-motion'

const navItems = [
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  const { isAuthenticated, signOut, user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    const handleClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-brand-500/20">
            A
          </span>
          <span className="text-base uppercase tracking-[0.35em] text-slate-200">AI Exchange</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="text-sm font-medium text-slate-300 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-3 rounded-full border border-slate-800/50 bg-slate-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="hidden sm:inline">{user?.username || 'Member'}</span>
              </button>
              <AnimatePresence>
                {dropdownOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 z-50 mt-3 w-52 rounded-3xl border border-slate-800/30 bg-slate-950 p-3 shadow-2xl shadow-slate-950/40"
                  >
                    <Link
                      to="/profile"
                      className="block rounded-3xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="mt-1 block rounded-3xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={signOut}
                      className="mt-3 w-full rounded-3xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
                    >
                      Sign out
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-3 lg:flex">
              <Link to="/login" className="text-sm font-medium text-slate-300 transition hover:text-white">
                Sign in
              </Link>
              <Link to="/register">
                <Button className="whitespace-nowrap">Join now</Button>
              </Link>
            </div>
          )}

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-slate-800/60 bg-slate-900/80 text-slate-200 transition hover:bg-slate-800 lg:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <span className="text-xl">{menuOpen ? '×' : '☰'}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-slate-800/10 bg-slate-950/95 lg:hidden"
          >
            <div className="space-y-2 px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block rounded-3xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="block rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
