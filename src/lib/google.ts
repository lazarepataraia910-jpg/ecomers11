export const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? ''

/**
 * Reads the email from a Google ID token and checks its claims.
 * This runs in the browser only, so it is a demo-grade check: real token
 * verification needs a server (Supabase does it in signInWithIdToken).
 */
export function parseGoogleCredential(credential: string): { email: string } {
  try {
    const b64 = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(Array.from(atob(b64), (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''))
    const p = JSON.parse(json) as { iss?: string; aud?: string; exp?: number; email?: string; email_verified?: boolean }
    const issOk = p.iss === 'accounts.google.com' || p.iss === 'https://accounts.google.com'
    if (!issOk || p.aud !== GOOGLE_CLIENT_ID || !p.exp || p.exp * 1000 < Date.now()) throw new Error()
    if (!p.email || !p.email_verified) throw new Error()
    return { email: p.email.toLowerCase() }
  } catch {
    throw new Error('Google sign-in failed. Please try again.')
  }
}
