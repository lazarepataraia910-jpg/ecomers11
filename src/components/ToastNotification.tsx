import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

type Kind = 'success' | 'error'
const Ctx = createContext<(msg: string, kind?: Kind) => void>(() => {})
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; kind: Kind; id: number } | null>(null)
  const show = useCallback((msg: string, kind: Kind = 'success') => {
    const id = Date.now()
    setToast({ msg, kind, id })
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 4000)
  }, [])
  return (
    <Ctx.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-4">
        {toast && (
          <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-n-200 bg-white px-4 py-3 text-sm shadow-card">
            {toast.kind === 'success' ? <CheckCircle2 size={18} className="text-success" /> : <AlertCircle size={18} className="text-danger" />}
            {toast.msg}
          </div>
        )}
      </div>
    </Ctx.Provider>
  )
}
