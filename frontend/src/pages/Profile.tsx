import { useAuth } from '../auth/AuthProvider'
import { Button } from '../components/ui'

export default function Profile() {
  const { user, signOut } = useAuth()

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Profile</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Your account</h1>
          </div>
          <Button variant="secondary" onClick={signOut} type="button">
            Log out
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Account</h2>
            <p className="mt-4 text-sm text-slate-600">Username</p>
            <p className="mt-2 text-base font-medium text-slate-900">{user?.username}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
            <p className="mt-4 text-sm text-slate-600">Email</p>
            <p className="mt-2 text-base font-medium text-slate-900">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
