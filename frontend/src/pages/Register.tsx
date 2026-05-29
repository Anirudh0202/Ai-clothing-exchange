import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../auth/AuthProvider'
import { useToast } from '../components/ui/ToastProvider'
import { Button, Input } from '../components/ui'

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
    } catch {
      showToast({ message: 'Unable to register. Please try again.', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-96px)] grid-cols-1 gap-8 lg:grid-cols-[0.95fr_0.9fr]">
      <motion.aside
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-[2rem] bg-slate-900/95 p-10 shadow-soft"
      >
        <div className="space-y-8 text-slate-100">
          <div>
            <p className="text-sm uppercase tracking-[0.36em] text-brand-300/90">Get started</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">Create your exchange account.</h1>
          </div>
          <p className="max-w-md text-base leading-8 text-slate-400">
            Join a premium marketplace built for fashion lovers who want to trade sustainably.
          </p>
          <div className="grid gap-4 rounded-[1.75rem] border border-slate-800/60 bg-slate-950/90 p-6">
            <div className="space-y-2">
              <p className="font-semibold text-white">What you get</p>
              <ul className="space-y-2 text-slate-400">
                <li>• Personalized exchange dashboard</li>
                <li>• High-impact item discovery</li>
                <li>• Image-first browsing experience</li>
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
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Create account</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Join the sustainable fashion community.</h2>
          </div>
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
            <div className="flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>Already registered?</span>
              <Link to="/login" className="text-brand-300 transition hover:text-white">
                Sign in
              </Link>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Register'}
            </Button>
          </form>
        </div>
      </motion.section>
    </div>
  )
}
