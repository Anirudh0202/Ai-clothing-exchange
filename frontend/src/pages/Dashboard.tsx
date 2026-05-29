import { motion } from 'framer-motion'
import { Button } from '../components/ui'
import { Link } from 'react-router-dom'

const stats = [
  { label: 'Active listings', value: 12 },
  { label: 'Market views', value: 4_820 },
  { label: 'Exchange requests', value: 7 },
]

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] border border-slate-800/40 bg-slate-950/90 p-8 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Welcome back</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Your exchange dashboard</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Manage listings, monitor activity, and refresh your profile with confidence.
            </p>
          </div>
          <Link to="/marketplace/create">
            <Button variant="primary">Create new listing</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <motion.div
            whileHover={{ y: -4 }}
            key={stat.label}
            className="rounded-[2rem] border border-slate-800/40 bg-slate-950/90 p-6 shadow-soft"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
            <p className="mt-5 text-4xl font-semibold text-white">{stat.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-800/40 bg-slate-950/90 p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Insights</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Listing momentum</h2>
            </div>
            <span className="rounded-full bg-brand-500/10 px-3 py-1 text-sm text-brand-200">Updated hourly</span>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-400">
            Keep your most popular items visible by refreshing photos, writing clear descriptions, and marking availability accurately.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-800/40 bg-slate-950/90 p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-white">Quick actions</h2>
          <div className="mt-6 grid gap-4">
            {[
              'Add a new listing',
              'Review exchange requests',
              'Update your profile details',
            ].map((action) => (
              <div key={action} className="rounded-[1.75rem] border border-slate-800/60 bg-slate-900/80 p-5 text-sm text-slate-300">
                {action}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
