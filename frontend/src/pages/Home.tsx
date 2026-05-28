import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export default function Home() {
  return (
    <div className="grid min-h-[calc(100vh-96px)] place-items-center py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-soft">
        <div className="max-w-2xl text-center">
          <p className="mb-3 inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
            AI-Powered Clothing Exchange
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Discover, swap, and style with curated fashion pieces.
          </h1>
          <p className="mt-6 text-base leading-8 text-slate-600">
            Build your wardrobe responsibly through a modern marketplace that connects fashion lovers for smart exchanges and sustainable shopping.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link to="/marketplace">
            <Button>Browse marketplace</Button>
          </Link>
          <Link to="/register">
            <Button variant="secondary">Create account</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
