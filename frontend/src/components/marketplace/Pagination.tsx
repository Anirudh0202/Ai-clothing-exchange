export default function Pagination({ pageInfo, onPage }: { pageInfo: { count: number; next: string | null; previous: string | null }; onPage: (url: string | null) => void }) {
  const total = pageInfo.count
  return (
    <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
      <div>{total} items</div>
      <div className="flex items-center gap-2">
        <button onClick={() => onPage(pageInfo.previous)} disabled={!pageInfo.previous} className="rounded-md border px-3 py-1 disabled:opacity-40">
          Prev
        </button>
        <button onClick={() => onPage(pageInfo.next)} disabled={!pageInfo.next} className="rounded-md border px-3 py-1 disabled:opacity-40">
          Next
        </button>
      </div>
    </div>
  )
}
