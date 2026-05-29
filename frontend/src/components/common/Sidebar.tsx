import { Link } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/profile', label: 'Profile' },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-80 shrink-0 rounded-[2rem] border border-slate-800/40 bg-slate-950/90 p-6 shadow-soft lg:block">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Workspace</p>
          <h2 className="text-2xl font-semibold text-white">Control Center</h2>
          <p className="text-sm leading-6 text-slate-400">Navigate your listings, activity, and account settings from one place.</p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block rounded-3xl border border-slate-800/50 bg-slate-900/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-brand-500 hover:bg-slate-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="rounded-[1.75rem] bg-gradient-to-br from-indigo-500/10 via-slate-950 to-slate-900 p-5 text-sm text-slate-300">
          <p className="font-semibold text-white">Pro tip</p>
          <p className="mt-3 leading-6">Keep your listings fresh and your profile complete to get the most sustainable exchanges.</p>
        </div>
      </div>
    </aside>
  )
}
