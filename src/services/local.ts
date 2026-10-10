import type { AuthService, Note, NotesService, User } from '../lib/types'

// Temporary localStorage backend. Passwords are salted+hashed with WebCrypto,
// but this is NOT secure authentication: use Supabase for real deployments.
const USERS = 'notes.users'
const SESSION = 'notes.session'
const NOTES = 'notes.notes'

const read = <T,>(k: string, d: T): T => {
  try { return JSON.parse(localStorage.getItem(k) ?? '') as T } catch { return d }
}
const write = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v))
const delay = () => new Promise((r) => setTimeout(r, 300))

async function hash(password: string, salt: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + password))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}
interface StoredUser extends User { salt: string; hash: string }

export const localAuth: AuthService = {
  async getSession() { return read<User | null>(SESSION, null) },
  async signUp(email, password) {
    await delay()
    const users = read<StoredUser[]>(USERS, [])
    const e = email.trim().toLowerCase()
    if (users.some((u) => u.email === e)) throw new Error('An account with this email already exists')
    const salt = crypto.randomUUID()
    const u: StoredUser = { id: crypto.randomUUID(), email: e, salt, hash: await hash(password, salt) }
    write(USERS, [...users, u])
    const user = { id: u.id, email: u.email }
    write(SESSION, user)
    return user
  },
  async signIn(email, password) {
    await delay()
    const e = email.trim().toLowerCase()
    const u = read<StoredUser[]>(USERS, []).find((x) => x.email === e)
    if (!u || u.hash !== (await hash(password, u.salt))) throw new Error('Invalid email or password')
    const user = { id: u.id, email: u.email }
    write(SESSION, user)
    return user
  },
  async signOut() { localStorage.removeItem(SESSION) },
}

export const localNotes: NotesService = {
  async list(userId) { await delay(); return read<Note[]>(NOTES, []).filter((n) => n.user_id === userId) },
  async create(userId, input) {
    const now = new Date().toISOString()
    const note: Note = { id: crypto.randomUUID(), user_id: userId, title: '', content: '', tags: [], archived: false, ...input, created_at: now, updated_at: now }
    write(NOTES, [...read<Note[]>(NOTES, []), note])
    return note
  },
  async update(id, input) {
    const all = read<Note[]>(NOTES, [])
    const i = all.findIndex((n) => n.id === id)
    if (i < 0) throw new Error('Note not found')
    all[i] = { ...all[i], ...input, updated_at: new Date().toISOString() }
    write(NOTES, all)
    return all[i]
  },
  async remove(id) { write(NOTES, read<Note[]>(NOTES, []).filter((n) => n.id !== id)) },
}
