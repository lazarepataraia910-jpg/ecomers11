export interface User { id: string; email: string }
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
  signOut(): Promise<void>
}
export interface NotesService {
  list(userId: string): Promise<Note[]>
  create(userId: string, input: NoteInput): Promise<Note>
  update(id: string, input: NoteInput): Promise<Note>
  remove(id: string): Promise<void>
}
