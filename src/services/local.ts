import { parseGoogleCredential } from '../lib/google'
import type { AdminNote, AdminService, AuthService, Note, NotesService, User } from '../lib/types'

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
interface StoredUser { id: string; email: string; salt: string; hash: string; created_at?: string }
// Demo rule: the first account registered in this browser is the admin
// (also covers accounts created before the admin panel existed).
const toUser = (u: StoredUser): User => ({ id: u.id, email: u.email, isAdmin: read<StoredUser[]>(USERS, [])[0]?.id === u.id })

export const localAuth: AuthService = {
  async getSession() {
    const s = read<User | null>(SESSION, null)
    const u = s && read<StoredUser[]>(USERS, []).find((x) => x.id === s.id)
    return u ? toUser(u) : null
  },
  async signUp(email, password) {
    await delay()
    const users = read<StoredUser[]>(USERS, [])
    const e = email.trim().toLowerCase()
    if (users.some((u) => u.email === e)) throw new Error('An account with this email already exists')
    const salt = crypto.randomUUID()
    const u: StoredUser = { id: crypto.randomUUID(), email: e, salt, hash: await hash(password, salt), created_at: new Date().toISOString() }
    write(USERS, [...users, u])
    const user = toUser(u)
    write(SESSION, user)
    return user
  },
  async signIn(email, password) {
    await delay()
    const e = email.trim().toLowerCase()
    const u = read<StoredUser[]>(USERS, []).find((x) => x.email === e)
    if (!u || u.hash !== (await hash(password, u.salt))) throw new Error('Invalid email or password')
    const user = toUser(u)
    write(SESSION, user)
    return user
  },
  async signInWithGoogle(credential) {
    const { email } = parseGoogleCredential(credential)
    const users = read<StoredUser[]>(USERS, [])
    let u = users.find((x) => x.email === email)
    if (!u) {
      // Google-only account: empty hash means password login can never match it.
      u = { id: crypto.randomUUID(), email, salt: '', hash: '', created_at: new Date().toISOString() }
      write(USERS, [...users, u])
    }
    const user = toUser(u)
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

export const localAdmin: AdminService = {
  async load() {
    await delay()
    const users = read<StoredUser[]>(USERS, [])
    const notes = read<Note[]>(NOTES, [])
    const email = (id: string) => users.find((u) => u.id === id)?.email ?? 'unknown'
    return {
      users: users.map((u) => ({ id: u.id, email: u.email, created_at: u.created_at ?? '', note_count: notes.filter((n) => n.user_id === u.id).length })),
      notes: notes.map<AdminNote>((n) => ({ ...n, owner_email: email(n.user_id) })),
    }
  },
  async deleteNote(id) { write(NOTES, read<Note[]>(NOTES, []).filter((n) => n.id !== id)) },
}
