import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import itemService from '../services/itemService'
import ItemCard from '../components/marketplace/ItemCard'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import { MarketItem } from '../features/marketplace/types'
import { getImageUrl } from '../utils/image'

export default function ItemDetails() {
  const { id } = useParams()
  const [item, setItem] = useState<MarketItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<MarketItem[]>([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    itemService
      .fetchItemDetail(id)
      .then((data) => setItem(data))
      .catch(() => setError('Unable to load item details.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    setRecommendationsLoading(true)
    setRecommendationsError(null)

    itemService
      .fetchItemRecommendations(id)
      .then((data) => setRecommendations(data))
      .catch(() => setRecommendationsError('Unable to load recommendations.'))
      .finally(() => setRecommendationsLoading(false))
  }, [id])

  if (loading) return <Loader />
  if (error) return <EmptyState title="Not found" description={error} />
  if (!item) return <EmptyState title="No item" description="This item no longer exists." />

  const image = getImageUrl(item.images?.[0]?.image || item.primary_image?.image)

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[0.65fr_0.35fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <img src={image} alt={item.title} className="h-[360px] w-full rounded-3xl object-cover" />
          <div className="mt-6 space-y-4">
            <h1 className="text-3xl font-semibold text-slate-900">{item.title}</h1>
            <p className="text-sm text-slate-500">Owned by {item.owner?.username || 'Community'}</p>
            <p className="text-base leading-7 text-slate-600">{item.description}</p>
          </div>
        </section>
        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Details</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900">{item.status || 'available'}</p>
          </div>
          <div className="space-y-4 rounded-3xl bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Condition</span>
              <span className="font-semibold text-slate-900">{item.condition || 'Good'}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Category</span>
              <span className="font-semibold text-slate-900">{item.category?.name || 'Fashion'}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Size</span>
              <span className="font-semibold text-slate-900">{item.size || 'Not listed'}</span>
            </div>
          </div>
          <button className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
            Request exchange
          </button>
        </aside>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Recommended For You</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Similar wardrobe picks</h2>
          </div>
          <p className="text-sm text-slate-500">Handpicked from the marketplace based on the current listing.</p>
        </div>

        <div className="mt-6">
          {recommendationsLoading ? (
            <Loader />
          ) : recommendationsError ? (
            <EmptyState title="Recommendations unavailable" description={recommendationsError} />
          ) : recommendations.length === 0 ? (
            <EmptyState title="No recommendations" description="We couldn't find any similar items right now." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((recommendation) => (
                <ItemCard key={recommendation.id} item={recommendation} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
