import { useAuth } from '../auth/AuthProvider'
import { Button } from '../components/ui'

export default function Profile() {
  const { user, signOut } = useAuth()

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] border border-slate-800/40 bg-slate-950/90 p-8 shadow-soft">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_0.6fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Your profile</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Welcome back, {user?.username || 'member'}.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Manage your account, review your stats, and keep your listings ready for the next exchange.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 rounded-[1.75rem] border border-slate-800/60 bg-slate-900/80 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/15 text-3xl font-bold text-brand-200">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Member since</p>
              <p className="mt-2 text-xl font-semibold text-white">2024</p>
            </div>
            <Button variant="secondary" onClick={signOut} type="button">
              Sign out
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-800/40 bg-slate-950/90 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Username</p>
          <p className="mt-3 text-xl font-semibold text-white">{user?.username}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-800/40 bg-slate-950/90 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Email</p>
          <p className="mt-3 text-xl font-semibold text-white">{user?.email}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-800/40 bg-slate-950/90 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Account status</p>
          <p className="mt-3 text-xl font-semibold text-white">Verified</p>
        </div>
      </section>
    </div>
  )
}
