import { createClient } from '@supabase/supabase-js'
import type { AuthService, NotesService, Note } from '../lib/types'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
export const supabase = url && key ? createClient(url, key) : null

const toUser = (u: { id: string; email?: string }) => ({ id: u.id, email: u.email ?? '' })

export const supabaseAuth: AuthService = {
  async getSession() {
    const { data } = await supabase!.auth.getSession()
    return data.session ? toUser(data.session.user) : null
  },
  async signUp(email, password) {
    const { data, error } = await supabase!.auth.signUp({ email: email.trim(), password })
    if (error) throw new Error(error.message)
    // With email confirmation enabled there is no session yet: do not pretend the user is signed in.
    if (!data.session || !data.user) throw new Error('Account created. Check your email to confirm it, then log in.')
    return toUser(data.user)
  },
  async signIn(email, password) {
    const { data, error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw new Error(error.message)
    return toUser(data.user)
  },
  async signOut() { await supabase!.auth.signOut() },
}

export const supabaseNotes: NotesService = {
  async list() {
    const { data, error } = await supabase!.from('notes').select('*')
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
