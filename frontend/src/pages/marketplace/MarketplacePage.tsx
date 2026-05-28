import ItemCard from '../../components/marketplace/ItemCard'
import SearchBar from '../../components/marketplace/SearchBar'
import Pagination from '../../components/marketplace/Pagination'
import { useItems } from '../../hooks/useItems'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from '../../hooks/useDebounce'
import Skeleton from '../../components/ui/Skeleton'
import { useMemo } from 'react'

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const page = searchParams.get('page') || '1'
  const debouncedQ = useDebounce(q, 300)

  const { items, loading, error, pageInfo, setQuery } = useItems({ page })

  // sync query params when debounced search changes
  useMemo(() => {
    setQuery((prev: any) => ({ ...prev, q: debouncedQ, page }))
  }, [debouncedQ, page, setQuery])

  function onSearch(qv: string) {
    setSearchParams((p) => {
      if (qv) p.set('q', qv)
      else p.delete('q')
      p.set('page', '1')
      return p
    })
  }

  function onPage(url: string | null) {
    if (!url) return
    const u = new URL(url)
    const p = u.searchParams.get('page') || '1'
    setSearchParams((s) => {
      s.set('page', p)
      return s
    })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <SearchBar onSearch={onSearch} />
      </div>

      {loading && <Skeleton rows={6} />}
      {error && <div className="text-red-500">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <ItemCard key={it.id} item={it} />
        ))}
      </div>

      <Pagination pageInfo={pageInfo} onPage={onPage} />
    </div>
  )
}
