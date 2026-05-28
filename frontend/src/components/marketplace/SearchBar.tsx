import { useState } from 'react'

export default function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState('')
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    onSearch(value)
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex w-full gap-2">
        <input
          type="search"
          placeholder="Search items, brand or location"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none"
        />
        <button type="submit" className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
          Search
        </button>
      </div>
    </form>
  )
}
