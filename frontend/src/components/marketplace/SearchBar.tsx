type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSearch?: (value: string) => void
}

export default function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  const submit = (event?: React.FormEvent) => {
    event?.preventDefault()
    onSearch?.(value)
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex w-full gap-2">
        <input
          type="search"
          placeholder="Search items, brand or location"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none"
          aria-label="Search items"
        />
        <button type="submit" className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
          Search
        </button>
      </div>
    </form>
  )
}
