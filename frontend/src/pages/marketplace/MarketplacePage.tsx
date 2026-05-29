import { useEffect, useMemo, useRef, useState } from 'react'
import ItemCard from '../../components/marketplace/ItemCard'
import SearchBar from '../../components/marketplace/SearchBar'
import Pagination from '../../components/marketplace/Pagination'
import { useItems } from '../../hooks/useItems'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from '../../hooks/useDebounce'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import itemApi from '../../services/itemApi'

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const conditionOptions = [
  { value: '', label: 'Any' },
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
]
const statusOptions = [
  { value: '', label: 'Any' },
  { value: 'available', label: 'Available' },
  { value: 'pending', label: 'Pending' },
  { value: 'archived', label: 'Archived' },
]
const sortOptions = [
  { value: '-created_at', label: 'Newest' },
  { value: 'created_at', label: 'Oldest' },
  { value: 'title', label: 'Title A–Z' },
  { value: '-title', label: 'Title Z–A' },
  { value: 'brand', label: 'Brand A–Z' },
  { value: '-brand', label: 'Brand Z–A' },
]

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const page = searchParams.get('page') || '1'
  const category = searchParams.get('category') || ''
  const condition = searchParams.get('condition') || ''
  const size = searchParams.get('size') || ''
  const status = searchParams.get('status') || ''
  const ordering = searchParams.get('ordering') || '-created_at'
  const selectedTags = searchParams.getAll('tag')

  const [searchInput, setSearchInput] = useState(q)
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([])
  const [tags, setTags] = useState<Array<{ id: number; name: string }>>([])

  const debouncedSearch = useDebounce(searchInput, 300)
  const initSearch = useRef(true)
  const lastSearchRef = useRef(q)

  useEffect(() => {
    setSearchInput(q)
    lastSearchRef.current = q
  }, [q])

  useEffect(() => {
    itemApi.categories().then((data) => setCategories(data)).catch(() => {})
    itemApi.tags().then((data) => setTags(data)).catch(() => {})
  }, [])

  const updateParams = (updates: Record<string, string | string[] | null | undefined>, resetPage = true) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (resetPage) {
        next.set('page', '1')
      }
      Object.entries(updates).forEach(([key, value]) => {
        next.delete(key)
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item !== undefined && item !== null && item !== '') {
              next.append(key, item)
            }
          })
        } else if (value !== undefined && value !== null && value !== '') {
          next.set(key, value)
        }
      })
      if (!next.get('page')) {
        next.set('page', '1')
      }
      return next
    })
  }

  useEffect(() => {
    if (initSearch.current) {
      initSearch.current = false
      return
    }

    if (debouncedSearch !== lastSearchRef.current) {
      updateParams({ q: debouncedSearch, page: '1' })
      lastSearchRef.current = debouncedSearch
    }
  }, [debouncedSearch])

  const queryParams = useMemo(
    () => ({
      page,
      q: debouncedSearch,
      category: category || undefined,
      condition: condition || undefined,
      size: size || undefined,
      status: status || undefined,
      ordering,
      tag: selectedTags.length ? selectedTags : undefined,
    }),
    [page, debouncedSearch, category, condition, size, status, ordering, selectedTags.join(',')],
  )

  const { items, loading, error, pageInfo, refresh } = useItems(queryParams)

  function onSearch(value: string) {
    setSearchInput(value)
    updateParams({ q: value, page: '1' })
  }

  function onPage(url: string | null) {
    if (!url) return
    const u = new URL(url)
    const nextPage = u.searchParams.get('page') || '1'
    updateParams({ page: nextPage }, false)
  }

  function toggleTag(tagName: string) {
    const nextTags = selectedTags.includes(tagName)
      ? selectedTags.filter((tag) => tag !== tagName)
      : [...selectedTags, tagName]
    updateParams({ tag: nextTags, page: '1' })
  }

  function clearFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams()
      if (q) next.set('q', q)
      next.set('page', '1')
      return next
    })
    setSearchInput(q)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 space-y-4">
        <SearchBar value={searchInput} onChange={setSearchInput} onSearch={onSearch} />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Filters</div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(event) => updateParams({ category: event.target.value, page: '1' })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="">All</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Condition</label>
                <select
                  value={condition}
                  onChange={(event) => updateParams({ condition: event.target.value, page: '1' })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  {conditionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Size</label>
                <select
                  value={size}
                  onChange={(event) => updateParams({ size: event.target.value, page: '1' })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="">All</option>
                  {sizeOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Availability</label>
                <select
                  value={status}
                  onChange={(event) => updateParams({ status: event.target.value, page: '1' })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Sort</label>
                <select
                  value={ordering}
                  onChange={(event) => updateParams({ ordering: event.target.value, page: '1' })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Tags</div>
              <button
                type="button"
                onClick={() => updateParams({ tag: [], page: '1' })}
                className="text-sm text-brand-600 hover:underline"
              >
                Clear tags
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => {
                const active = selectedTags.includes(tag.name)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={`rounded-full border px-3 py-1 text-sm transition ${
                      active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-slate-700'
                    }`}
                    aria-pressed={active}
                  >
                    {tag.name}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
              <span>{selectedTags.length} tag{selectedTags.length === 1 ? '' : 's'} selected</span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-brand-600 hover:underline"
              >
                Reset filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="space-y-4 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p>{error}</p>
          <button onClick={refresh} className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <Skeleton rows={6} />
      ) : items.length === 0 ? (
        <EmptyState title="No matching items" description="Try a different keyword, reset filters, or browse later." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          <Pagination pageInfo={pageInfo} onPage={onPage} />
        </>
      )}
    </div>
  )
}
