import Navbar from '../components/common/Navbar'

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),transparent_35%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
