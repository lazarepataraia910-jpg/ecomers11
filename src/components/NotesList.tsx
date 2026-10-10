import { Plus } from 'lucide-react'
import type { Note } from '../lib/types'
import { NoteCard } from './NoteCard'
import { EmptyState } from './EmptyState'

export type Sort = 'updated' | 'created'
interface Props {
  notes: Note[]; activeId?: string; loading: boolean; error: string; search: string; view: 'all' | 'archived' | 'tag'
  sort: Sort; onSort: (s: Sort) => void; onSelect: (id: string) => void; onCreate: () => void; creating: boolean; onRetry: () => void
}

export function NotesList({ notes, activeId, loading, error, search, view, sort, onSort, onSelect, onCreate, creating, onRetry }: Props) {
  let body
  if (loading) body = <p className="p-2 text-sm text-n-600">Loading notes…</p>
  else if (error) body = (
    <div role="alert" className="space-y-2 p-2 text-sm"><p className="text-danger">{error}</p><button type="button" className="btn-secondary" onClick={onRetry}>Try again</button></div>)
  else if (notes.length === 0) body = search
    ? <EmptyState>No notes match your search “{search}”. Try a different keyword.</EmptyState>
    : <EmptyState>{view === 'archived' ? 'No notes have been archived yet. Move notes here for safekeeping.' : view === 'tag' ? 'No notes use this tag.' : 'You don’t have any notes yet. Start a new note to capture your thoughts and ideas.'}</EmptyState>
  else body = <ul className="space-y-1">{notes.map((n) => <NoteCard key={n.id} note={n} active={n.id === activeId} onSelect={() => onSelect(n.id)} />)}</ul>

  return (
    <section aria-label="Notes list" className="flex h-full flex-col gap-3 p-4">
      <button type="button" className="btn-primary w-full" onClick={onCreate} disabled={creating}><Plus size={16} /> {creating ? 'Creating…' : 'Create New Note'}</button>
      <label className="flex items-center gap-2 text-sm text-n-600">
        Sort by
        <select value={sort} onChange={(e) => onSort(e.target.value as Sort)} className="input !w-auto !py-1.5">
          <option value="updated">Last updated</option>
          <option value="created">Date created</option>
        </select>
      </label>
      <div className="min-h-0 flex-1 overflow-y-auto">{body}</div>
    </section>
  )
}
