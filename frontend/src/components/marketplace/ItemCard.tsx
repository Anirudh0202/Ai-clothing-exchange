import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MarketItem } from '../../features/marketplace/types'
import { getImageUrl } from '../../utils/image'

export default function ItemCard({ item }: { item: MarketItem }) {
  const image = getImageUrl(item.primary_image?.image || item.images?.[0]?.image)

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-[2rem] border border-slate-800/40 bg-slate-950/90 shadow-soft transition duration-300 hover:border-brand-500"
    >
      <Link to={`/marketplace/${item.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
          <img
            src={image}
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.category?.name || 'Clothing'}</p>
          </div>
        </div>
        <div className="space-y-2 p-5">
          <h3 className="text-base font-semibold text-white">{item.title}</h3>
          <p className="max-h-12 overflow-hidden text-sm leading-6 text-slate-400">{item.description}</p>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
            <span>{[item.brand, item.size, item.condition].filter(Boolean).join(' · ') || 'Community find'}</span>
            <span className="rounded-full bg-slate-900/80 px-3 py-1 uppercase tracking-[0.22em] text-slate-300">
              {item.status || 'available'}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
