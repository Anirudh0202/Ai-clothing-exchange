import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import itemService from '../services/itemService'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import { MarketItem } from '../features/marketplace/types'

export default function Marketplace() {
  const [items, setItems] = useState<MarketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    itemService
      .fetchMarketplace()
      .then((data) => setItems(data))
      .catch(() => setError('Unable to load marketplace items.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <EmptyState title="Oops" description={error} />
  if (items.length === 0)
    return <EmptyState title="No items available" description="Check back later for more clothing drops." />

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-slate-900">Marketplace</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Discover clothing items available for exchange across the community.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link key={item.id} to={`/marketplace/${item.id}`} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100">
              <img src={item.image || 'https://images.unsplash.com/photo-1525026198546-ebb0aa5d6cf6?auto=format&fit=crop&w=800&q=60'} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            </div>
            <div className="mt-5 space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
              <p className="text-sm leading-6 text-slate-600 overflow-hidden text-ellipsis max-h-14">{item.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm font-semibold text-brand-600">
                <span>${item.price.toFixed(2)}</span>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs uppercase tracking-[0.22em] text-brand-700">View</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
