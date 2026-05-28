export default function Loader() {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-soft">
      <div className="flex items-center gap-3 text-slate-700">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <span>Loading...</span>
      </div>
    </div>
  )
}
