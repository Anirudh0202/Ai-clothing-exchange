import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import itemApi from '../services/itemApi'
import itemService from '../services/itemService'
import { Button } from '../components/ui'
import EmptyState from '../components/ui/EmptyState'
import { MarketItem } from '../features/marketplace/types'

export default function Home() {
  const [items, setItems] = useState<MarketItem[]>([])
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([itemService.fetchMarketplace(), itemApi.categories()])
      .then(([marketItems, categoryList]) => {
        setItems(marketItems)
        setCategories(categoryList)
      })
      .catch(() => setError('Unable to load featured items.'))
      .finally(() => setLoading(false))
  }, [])

  const featuredItems = useMemo(() => items.slice(0, 4), [items])

  if (error) return <EmptyState title="Something went wrong" description={error} />

  return (
    <div className="space-y-12">
      <section className="rounded-[2rem] border border-slate-800/50 bg-slate-950/90 p-8 shadow-glow backdrop-blur-xl lg:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-brand-100">
              Sustainable fashion, reimagined
            </div>
            <div>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Exchange style with a smarter, more sustainable wardrobe.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Discover curated outfits, list your favorite pieces, and join a marketplace built for a fashion-forward community.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/marketplace">
                <Button>Explore marketplace</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary">Start listing</Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {featuredItems.map((item) => (
              <Link
                to={`/marketplace/${item.id}`}
                key={item.id}
                className="group overflow-hidden rounded-[1.75rem] border border-slate-800/60 bg-slate-900/95 shadow-soft transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
                  <img
                    src={item.primary_image?.image || 'https://images.unsplash.com/photo-1525026198546-ebb0aa5d6cf6?auto=format&fit=crop&w=800&q=60'}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.category?.name || 'Fashion'}</p>
                    <h2 className="mt-2 text-lg font-semibold text-white">{item.title}</h2>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-800/50 bg-slate-950/90 p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Browse by category</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Find pieces with impact</h2>
            </div>
            <Link to="/marketplace" className="text-sm font-semibold text-brand-300 transition hover:text-white">
              View all categories
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                to={`/marketplace/list?category=${category.slug}`}
                className="block rounded-[1.75rem] border border-slate-800/60 bg-slate-900/70 p-6 transition hover:border-brand-500 hover:bg-slate-900"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{category.name}</p>
                <p className="mt-3 text-xl font-semibold text-white">Shop now</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800/50 bg-slate-950/90 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Why members love it</p>
          <div className="mt-8 space-y-5">
            {[
              'Curated community marketplace',
              'Seamless listing & image-first browsing',
              'Sustainable fashion with smart exchanges',
            ].map((feature) => (
              <div key={feature} className="rounded-[1.75rem] border border-slate-800/60 bg-slate-900/80 p-5">
                <p className="text-base font-semibold text-white">{feature}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Experience a premium fashion swap platform built for effortless discovery.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
