import { useEffect, useState } from 'react'
import itemApi from '../../services/itemApi'
import { useAuth } from '../../auth/AuthProvider'
import ItemCard from '../../components/marketplace/ItemCard'
import { Navigate } from 'react-router-dom'

export default function UserItemsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    itemApi.list({ owner: user.id }).then((d) => setItems(d.results))
  }, [user])

  if (!user) return <Navigate to="/login" />

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-800/40 bg-slate-950/90 p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Your closet</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Listings you manage</h1>
          </div>
          <p className="text-sm text-slate-400">Review and update your marketplace items from one elegant view.</p>
        </div>
      </section>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => (
          <ItemCard key={it.id} item={it} />
        ))}
      </div>
    </div>
  )
}
