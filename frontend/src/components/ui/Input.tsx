import { InputHTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <label className="block text-sm text-slate-200">
      {label && <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</span>}
      <input
        className={classNames(
          'w-full rounded-[1.5rem] border border-slate-800/60 bg-slate-950/90 px-4 py-4 text-sm text-slate-100 shadow-sm shadow-slate-950/20 transition duration-200 placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : '',
          className,
        )}
        {...props}
      />
      {error && <span className="mt-2 block text-xs text-red-400">{error}</span>}
    </label>
  )
}
