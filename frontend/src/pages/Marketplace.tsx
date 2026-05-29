import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
    <div className="space-y-10">
      <section className="rounded-[2rem] border border-slate-800/50 bg-slate-950/90 p-8 shadow-glow backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Marketplace</p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Shop curated pieces in an image-first fashion destination.</h1>
          </div>
          <div className="rounded-3xl border border-slate-800/60 bg-slate-900/80 px-5 py-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Trending now</p>
            <p className="mt-2 text-slate-400">Discover fresh listings from community closets.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -6 }}
            className="group overflow-hidden rounded-[2rem] border border-slate-800/50 bg-slate-950/95 shadow-soft transition-shadow duration-300"
          >
            <Link to={`/marketplace/${item.id}`} className="block">
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                <img
                  src={item.primary_image?.image || item.images?.[0]?.image || 'https://images.unsplash.com/photo-1525026198546-ebb0aa5d6cf6?auto=format&fit=crop&w=800&q=60'}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent p-4">
                  <span className="inline-flex rounded-full bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
                    {item.category?.name || 'Fashion'}
                  </span>
                </div>
              </div>
              <div className="space-y-3 p-5">
                <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                <p className="max-h-12 overflow-hidden text-sm leading-6 text-slate-400">{item.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                  <span>{item.owner?.username || 'Community'}</span>
                  <span className="rounded-full bg-slate-800/80 px-3 py-1 uppercase tracking-[0.22em] text-slate-300">
                    {item.status || 'available'}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
