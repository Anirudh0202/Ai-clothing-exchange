import { Button } from '../components/ui'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Overview</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Marketplace dashboard</h1>
          </div>
          <Button variant="secondary">Create exchange request</Button>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {['Listed items', 'Exchange requests', 'Active matches'].map((card) => (
            <div key={card} className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-500">{card}</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">0</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Action center</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Use your dashboard to manage listings, exchange proposals, and update your profile for better matches.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Activity feed</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Recent activity will appear here once you start interacting with the marketplace.</p>
        </div>
      </div>
    </div>
  )
}
