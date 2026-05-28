import { InputHTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <label className="block text-sm text-slate-700">
      {label && <span className="mb-2 block font-medium">{label}</span>}
      <input
        className={classNames(
          'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : '',
          className,
        )}
        {...props}
      />
      {error && <span className="mt-2 block text-xs text-red-600">{error}</span>}
    </label>
  )
}
