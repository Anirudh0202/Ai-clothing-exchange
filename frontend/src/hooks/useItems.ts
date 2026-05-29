import { useEffect, useState, useCallback } from 'react'
import itemApi from '../services/itemApi'
import { MarketItem } from '../features/marketplace/types'

export function useItems(initialQuery = {}) {
  const [items, setItems] = useState<MarketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageInfo, setPageInfo] = useState({ count: 0, next: null as string | null, previous: null as string | null })
  const [query, setQuery] = useState<any>(initialQuery)

  useEffect(() => {
    const current = JSON.stringify(query)
    const next = JSON.stringify(initialQuery)
    if (current !== next) {
      setQuery(initialQuery)
    }
  }, [initialQuery, query])

  const fetch = useCallback(async (q = query) => {
    setLoading(true)
    setError(null)
    try {
      const data = await itemApi.list(q)
      setItems(data.results)
      setPageInfo({ count: data.count, next: data.next, previous: data.previous })
    } catch (err) {
      setError('Unable to load items')
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    fetch(query)
  }, [fetch, query])

  const refresh = () => fetch(query)

  return { items, loading, error, pageInfo, query, setQuery, refresh }
}
