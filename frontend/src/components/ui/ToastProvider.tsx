import { createContext, useContext, useMemo, useState } from 'react'

export interface ToastOptions {
  message: string
  variant?: 'success' | 'error' | 'info'
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null)

  const showToast = (options: ToastOptions) => {
    setToast(options)
    window.setTimeout(() => setToast(null), 3600)
  }

  const value = useMemo(() => ({ showToast }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-[1.75rem] border border-white/10 bg-slate-950/95 p-4 shadow-[0_18px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toast.variant === 'error' ? 'bg-red-500/10 text-red-300' : toast.variant === 'success' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700/10 text-slate-200'}`}>
              {toast.variant === 'success' ? '✓' : toast.variant === 'error' ? '!' : 'i'}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-100">{toast.variant?.toUpperCase() || 'INFO'}</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">{toast.message}</p>
            </div>
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
