import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export default function NotFound() {
  return (
    <div className="grid min-h-[calc(100vh-96px)] place-items-center py-16">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">The page you are looking for does not exist or has been moved.</p>
        <Link to="/">
          <Button className="mt-8">Return to home</Button>
        </Link>
      </div>
    </div>
  )
}
