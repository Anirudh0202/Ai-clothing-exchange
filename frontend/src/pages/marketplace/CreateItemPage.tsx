import ItemForm from '../../components/marketplace/ItemForm'
import { useAuth } from '../../auth/AuthProvider'
import { Navigate } from 'react-router-dom'

export default function CreateItemPage() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Create Item</h1>
      <ItemForm />
    </div>
  )
}
