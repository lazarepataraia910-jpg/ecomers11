import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PasswordField, TextField } from './AuthFields'
import { useAuth } from '../hooks/useAuth'
import { validateEmail, validatePassword } from '../lib/validation'

export function LoginForm() {
  const { signIn } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')

  const errors = { email: validateEmail(email), password: validatePassword(password, false) }
  const show = (k: 'email' | 'password') => (touched[k] ? errors[k] : '')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (errors.email || errors.password) return
    setBusy(true); setFormError('')
    try { await signIn(email, password); nav('/notes', { replace: true }) }
    catch (err) { setFormError((err as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <TextField label="Email Address" type="email" autoComplete="email" value={email} onChange={setEmail}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))} error={show('email')} disabled={busy} />
      <PasswordField label="Password" autoComplete="current-password" value={password} onChange={setPassword}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))} error={show('password')} disabled={busy} />
      {formError && <p role="alert" className="text-sm text-danger">{formError}</p>}
      <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
    </form>
  )
}
