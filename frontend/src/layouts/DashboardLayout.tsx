import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <Sidebar />
        <section className="min-w-0 flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          {children}
        </section>
      </div>
    </div>
  )
}
