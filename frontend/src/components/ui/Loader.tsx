export default function Loader() {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-[2rem] border border-slate-800/50 bg-slate-950/90 p-10 shadow-soft text-slate-100">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-brand-500 border-t-transparent bg-slate-900 animate-spin" />
        <div>
          <p className="text-lg font-semibold">Loading marketplace</p>
          <p className="text-sm text-slate-400">Preparing the latest items for you.</p>
        </div>
      </div>
    </div>
  )
}
