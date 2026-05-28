import { useEffect, useState } from 'react'
import itemApi from '../services/itemApi'
import { MarketItem } from '../features/marketplace/types'

export function useItem(id?: string | number) {
  const [item, setItem] = useState<MarketItem | null>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    itemApi
      .retrieve(id)
      .then((data) => setItem(data))
      .catch(() => setError('Unable to load item'))
      .finally(() => setLoading(false))
  }, [id])

  return { item, loading, error, setItem }
}
