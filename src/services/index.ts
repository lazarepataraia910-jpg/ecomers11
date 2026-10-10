import { localAuth, localNotes } from './local'
import { supabase, supabaseAuth, supabaseNotes } from './supabase'

export const usingSupabase = !!supabase
export const authService = supabase ? supabaseAuth : localAuth
export const notesService = supabase ? supabaseNotes : localNotes
