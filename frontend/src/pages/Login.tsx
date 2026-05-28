import { FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useToast } from '../components/ui/ToastProvider'
import { Button, Input } from '../components/ui'

export default function Login() {
  const { signIn } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    try {
      await signIn({ email, password })
      showToast({ message: 'Welcome back! Your session is ready.', variant: 'success' })
      navigate('/dashboard')
    } catch (error) {
      showToast({ message: 'Unable to sign in. Please check your credentials.', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Sign in</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Welcome back</h1>
      </header>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">New here?</span>
          <Link to="/register" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </section>
  )
}
