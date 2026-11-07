import { createClient } from '@supabase/supabase-js'
import type { AdminNote, AdminService, AdminUser, AuthService, NotesService, Note } from '../lib/types'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
export const supabase = url && key ? createClient(url, key) : null

const toUser = (u: { id: string; email?: string }) => ({ id: u.id, email: u.email ?? '' })

async function withAdminFlag(u: { id: string; email?: string }) {
  const { data } = await supabase!.from('admins').select('user_id').eq('user_id', u.id).maybeSingle()
  return { ...toUser(u), isAdmin: !!data }
}

export const supabaseAuth: AuthService = {
  async getSession() {
    const { data } = await supabase!.auth.getSession()
    return data.session ? withAdminFlag(data.session.user) : null
  },
  async signUp(email, password) {
    const { data, error } = await supabase!.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin + '/login' } })
    if (error) throw new Error(error.message)
    // With email confirmation enabled there is no session yet: do not pretend the user is signed in.
    if (!data.session || !data.user) throw new Error('Account created. Check your email to confirm it, then log in.')
    return toUser(data.user)
  },
  async signIn(email, password) {
    const { data, error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw new Error(error.message)
    return withAdminFlag(data.user)
  },
  async signInWithGoogle(credential) {
    const { data, error } = await supabase!.auth.signInWithIdToken({ provider: 'google', token: credential })
    if (error) throw new Error(error.message)
    return withAdminFlag(data.user)
  },
  async signOut() { await supabase!.auth.signOut() },
}

export const supabaseNotes: NotesService = {
  async list(userId) {
    // Explicit filter: admins can read every row, but their own dashboard shows only their notes.
    const { data, error } = await supabase!.from('notes').select('*').eq('user_id', userId)
    if (error) throw new Error(error.message)
    return data as Note[]
  },
  async create(userId, input) {
    const { data, error } = await supabase!.from('notes').insert({ user_id: userId, ...input }).select().single()
    if (error) throw new Error(error.message)
    return data as Note
  },
  async update(id, input) {
    const { data, error } = await supabase!.from('notes').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data as Note
  },
  async remove(id) {
    const { error } = await supabase!.from('notes').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}

export const supabaseAdmin: AdminService = {
  async load() {
    const [profiles, notes] = await Promise.all([
      supabase!.from('profiles').select('id,email,created_at').order('created_at', { ascending: false }),
      supabase!.from('notes').select('*').order('updated_at', { ascending: false }),
    ])
    if (profiles.error) throw new Error(profiles.error.message)
    if (notes.error) throw new Error(notes.error.message)
    const rows = notes.data as Note[]
    const email = new Map((profiles.data as { id: string; email: string }[]).map((p) => [p.id, p.email]))
    const users = (profiles.data as { id: string; email: string; created_at: string }[]).map<AdminUser>((p) => ({
      ...p, note_count: rows.filter((n) => n.user_id === p.id).length,
    }))
    return { users, notes: rows.map<AdminNote>((n) => ({ ...n, owner_email: email.get(n.user_id) ?? 'unknown' })) }
  },
  async deleteNote(id) {
    const { error } = await supabase!.from('notes').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}
