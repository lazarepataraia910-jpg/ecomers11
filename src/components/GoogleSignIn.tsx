import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { GOOGLE_CLIENT_ID } from '../lib/google'

interface GoogleId {
  initialize(o: { client_id: string; callback: (r: { credential: string }) => void }): void
  renderButton(el: HTMLElement, o: Record<string, unknown>): void
}
declare global { interface Window { google?: { accounts: { id: GoogleId } } } }

let script: Promise<void> | null = null
function loadGoogle() {
  script ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => { script = null; reject(new Error('Could not load Google sign-in. Check your connection.')) }
    document.head.appendChild(s)
  })
  return script
}

/** "Continue with Google" button plus divider. Renders nothing until VITE_GOOGLE_CLIENT_ID is set. */
export function GoogleSignIn() {
  const { signInWithGoogle } = useAuth()
  const nav = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const handler = useRef<(c: string) => void>(() => {})
  handler.current = async (credential) => {
    setBusy(true); setError('')
    try { await signInWithGoogle(credential); nav('/notes', { replace: true }) }
    catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false
    loadGoogle().then(() => {
      const el = ref.current
      if (cancelled || !el || !window.google) return
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: (r) => handler.current(r.credential) })
      window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', width: Math.min(el.offsetWidth || 320, 400) })
    }).catch((e: Error) => { if (!cancelled) setError(e.message) })
    return () => { cancelled = true }
  }, [])

  if (!GOOGLE_CLIENT_ID) return null
  return (
    <div className="mt-4">
      <div className="mb-4 flex items-center gap-3 text-sm text-n-600" aria-hidden>
        <span className="h-px flex-1 bg-n-200" /> or <span className="h-px flex-1 bg-n-200" />
      </div>
      <div ref={ref} className={`flex min-h-[44px] justify-center ${busy ? 'pointer-events-none opacity-60' : ''}`} />
      {busy && <p className="mt-2 text-center text-sm text-n-600">Signing in with Google…</p>}
      {error && <p role="alert" className="mt-2 text-center text-sm text-danger">{error}</p>}
    </div>
  )
}
