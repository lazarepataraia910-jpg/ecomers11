import { localAdmin, localAuth, localNotes } from './local'
import { supabase, supabaseAdmin, supabaseAuth, supabaseNotes } from './supabase'

export const usingSupabase = !!supabase
export const authService = supabase ? supabaseAuth : localAuth
export const notesService = supabase ? supabaseNotes : localNotes
export const adminService = supabase ? supabaseAdmin : localAdmin
