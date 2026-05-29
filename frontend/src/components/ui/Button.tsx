import { ButtonHTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const variantStyles = {
  primary:
    'bg-gradient-to-r from-brand-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:brightness-110',
  secondary:
    'bg-slate-900 text-white ring-1 ring-slate-700 hover:bg-slate-800 hover:ring-indigo-500',
  ghost:
    'bg-white/5 text-slate-100 hover:bg-white/10 border border-white/10',
}

export default function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center rounded-3xl px-5 py-3 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  )
}
