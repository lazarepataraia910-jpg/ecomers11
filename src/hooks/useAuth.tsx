import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '../lib/types'
import { authService } from '../services'

interface AuthCtx {
  user: User | null
  loading: boolean
  signUp: (e: string, p: string) => Promise<void>
  signIn: (e: string, p: string) => Promise<void>
  signOut: () => Promise<void>
}
const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authService.getSession().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false))
  }, [])

  const value: AuthCtx = {
    user, loading,
    signUp: async (e, p) => setUser(await authService.signUp(e, p)),
    signIn: async (e, p) => setUser(await authService.signIn(e, p)),
    signOut: async () => { await authService.signOut(); setUser(null) },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used inside AuthProvider')
  return c
}
