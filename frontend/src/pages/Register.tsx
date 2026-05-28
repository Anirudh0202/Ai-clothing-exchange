import { FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useToast } from '../components/ui/ToastProvider'
import { Button, Input } from '../components/ui'
import { RegisterCredentials } from '../features/auth/types'

export default function Register() {
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    try {
      await register({ username, email, password, password2 })
      showToast({ message: 'Your account has been created successfully.', variant: 'success' })
      navigate('/dashboard')
    } catch (error) {
      showToast({ message: 'Unable to register. Please try again.', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Create account</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Join the exchange</h1>
      </header>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
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
        <Input
          label="Confirm password"
          type="password"
          value={password2}
          onChange={(event) => setPassword2(event.target.value)}
          required
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Already registered?</span>
          <Link to="/login" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Register'}
        </Button>
      </form>
    </section>
  )
}
