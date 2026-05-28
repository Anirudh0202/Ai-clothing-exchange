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
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">My Items</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <ItemCard key={it.id} item={it} />
        ))}
      </div>
    </div>
  )
}
