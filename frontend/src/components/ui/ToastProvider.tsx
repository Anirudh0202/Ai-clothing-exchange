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
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-soft transition-opacity duration-300">
          <div className="flex items-start gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toast.variant === 'error' ? 'bg-red-100 text-red-700' : toast.variant === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
              {toast.variant === 'success' ? '✓' : toast.variant === 'error' ? '!' : 'i'}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{toast.variant?.toUpperCase() || 'INFO'}</p>
              <p className="mt-1 text-sm text-slate-600">{toast.message}</p>
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
