export interface User { id: string; email: string; isAdmin?: boolean }
export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  archived: boolean
  created_at: string
  updated_at: string
}
export type NoteInput = Partial<Pick<Note, 'title' | 'content' | 'tags' | 'archived'>>

/** Both backends implement these, so UI code never touches storage directly. */
export interface AuthService {
  getSession(): Promise<User | null>
  signUp(email: string, password: string): Promise<User>
  signIn(email: string, password: string): Promise<User>
  signInWithGoogle(credential: string): Promise<User>
  signOut(): Promise<void>
}
export interface NotesService {
  list(userId: string): Promise<Note[]>
  create(userId: string, input: NoteInput): Promise<Note>
  update(id: string, input: NoteInput): Promise<Note>
  remove(id: string): Promise<void>
}

export interface AdminUser { id: string; email: string; created_at: string; note_count: number }
export interface AdminNote extends Note { owner_email: string }
export interface AdminData { users: AdminUser[]; notes: AdminNote[] }
/** Read-only overview plus note moderation. Real enforcement lives in the database policies. */
export interface AdminService {
  load(): Promise<AdminData>
  deleteNote(id: string): Promise<void>
}
