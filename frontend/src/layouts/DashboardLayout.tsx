import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.16),transparent_22%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
        <Navbar />
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
          <Sidebar />
          <section className="min-w-0 flex-1 rounded-[2rem] border border-slate-800/40 bg-slate-900/95 p-6 shadow-soft backdrop-blur-xl">
            {children}
          </section>
        </div>
      </div>
    </div>
  )
}
