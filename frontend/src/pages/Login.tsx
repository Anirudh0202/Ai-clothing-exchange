import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
    } catch {
      showToast({ message: 'Unable to sign in. Please check your credentials.', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-96px)] grid-cols-1 gap-8 lg:grid-cols-[0.95fr_0.9fr]">
      <motion.aside
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-[2rem] bg-gradient-to-br from-brand-500 to-indigo-700 p-10 text-white shadow-soft"
      >
        <div className="space-y-8">
          <div>
            <p className="text-sm uppercase tracking-[0.36em] text-brand-100/80">Sign in</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight">Welcome back.</h1>
          </div>
          <p className="max-w-md text-base leading-8 text-brand-100/80">
            Rejoin the community, manage your wardrobe, and discover the latest fashion swaps tailored to your style.
          </p>
          <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/10 p-6 text-sm text-brand-100/90">
            <div className="space-y-2">
              <p className="font-semibold">Why exchange with us?</p>
              <ul className="space-y-2 text-slate-100/90">
                <li>• High-quality listings</li>
                <li>• Real member-driven marketplace</li>
                <li>• Fast, image-first browsing</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.aside>

      <motion.section
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-[2rem] border border-slate-800/50 bg-slate-950/90 p-10 shadow-soft"
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Access your account</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Sign in to your marketplace dashboard</h2>
          </div>
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
            <div className="flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>New here?</span>
              <Link to="/register" className="text-brand-300 transition hover:text-white">
                Create an account
              </Link>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </motion.section>
    </div>
  )
}
