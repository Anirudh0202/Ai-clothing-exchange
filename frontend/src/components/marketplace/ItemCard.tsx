import { Link } from 'react-router-dom'
import { MarketItem } from '../../features/marketplace/types'

export default function ItemCard({ item }: { item: MarketItem }) {
  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link to={`/marketplace/${item.id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
          <img src={item.image || 'https://images.unsplash.com/photo-1525026198546-ebb0aa5d6cf6?auto=format&fit=crop&w=800&q=60'} alt={item.title} className="h-full w-full object-cover" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
          <span className="text-sm font-bold text-brand-600">${item.price.toFixed(2)}</span>
        </div>
        <p className="mt-2 text-xs text-slate-600">{item.owner?.username || 'Community'}</p>
      </Link>
    </article>
  )
}
