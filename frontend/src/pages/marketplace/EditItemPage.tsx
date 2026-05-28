import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import itemApi from '../../services/itemApi'
import ItemForm from '../../components/marketplace/ItemForm'
import Loader from '../../components/ui/Loader'
import Skeleton from '../../components/ui/Skeleton'

export default function EditItemPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [item, setItem] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    itemApi.retrieve(id)
      .then((data) => setItem(data))
      .catch(() => setError('Unable to load item'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="container mx-auto px-4 py-6"><Skeleton /></div>
  if (error) return <div className="container mx-auto px-4 py-6 text-red-600">{error}</div>
  if (!item) return <div className="container mx-auto px-4 py-6">Not found</div>
  if (!user) return <Navigate to="/login" />
  if (item.owner?.id !== user.id) return <div className="container mx-auto px-4 py-6 text-red-600">You do not own this item.</div>

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Edit Item</h1>
      <ItemForm initial={item} onSubmitSuccess={() => {}} />
    </div>
  )
}
