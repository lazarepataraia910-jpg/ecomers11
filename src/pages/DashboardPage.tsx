import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { Sidebar, viewKey, type View } from '../components/Sidebar'
import { NotesList, type Sort } from '../components/NotesList'
import { NoteEditor } from '../components/NoteEditor'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../components/ToastNotification'
import { useAuth } from '../hooks/useAuth'
import { useNotes } from '../hooks/useNotes'
import type { NoteInput } from '../lib/types'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const { notes, loading, error, reload, create, update, remove } = useNotes(user!.id)
  const toast = useToast()
  const nav = useNavigate()
  const { noteId } = useParams()

  const [view, setView] = useState<View>({ kind: 'all' })
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<Sort>('updated')
  const [menuOpen, setMenuOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const tags = useMemo(() => [...new Set(notes.filter((n) => !n.archived).flatMap((n) => n.tags))].sort(), [notes])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    const key = sort === 'updated' ? 'updated_at' : 'created_at'
    return notes
      .filter((n) => (view.kind === 'archived' ? n.archived : !n.archived && (view.kind !== 'tag' || n.tags.includes(view.tag))))
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .sort((a, b) => b[key].localeCompare(a[key]))
  }, [notes, view, search, sort])

  const active = notes.find((n) => n.id === noteId)

  async function createNote() {
    setCreating(true)
    try {
      const n = await create()
      setView({ kind: 'all' }); setSearch('')
      nav(`/notes/${n.id}`)
    } catch (e) { toast((e as Error).message, 'error') }
    finally { setCreating(false) }
  }

  async function save(id: string, patch: NoteInput) {
    const n = await update(id, patch)
    if (patch.archived !== undefined) {
      toast(patch.archived ? 'Note archived' : 'Note restored')
      nav('/notes')
    }
    return n
  }

  async function doDelete() {
    if (!active) return
    setDeleting(true)
    try { await remove(active.id); toast('Note deleted'); nav('/notes') }
    catch (e) { toast((e as Error).message, 'error') }
    finally { setDeleting(false); setConfirmDelete(false) }
  }

  const title = view.kind === 'all' ? 'All Notes' : view.kind === 'archived' ? 'Archived Notes' : `Notes Tagged: ${view.tag}`

  return (
    <div className="flex h-screen bg-white">
      <Sidebar view={view} tags={tags} open={menuOpen} onClose={() => setMenuOpen(false)} onSelect={(v) => { setView(v); nav('/notes') }} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} search={search} onSearch={setSearch} onMenu={() => setMenuOpen(true)} email={user!.email}
          onSignOut={async () => { await signOut(); nav('/login') }} />
        <div className="flex min-h-0 flex-1">
          <div key={viewKey(view)} className={`${noteId ? 'hidden' : 'block'} w-full shrink-0 border-r border-n-200 md:block md:w-72 lg:w-80`}>
            <NotesList notes={visible} activeId={noteId} loading={loading} error={error} search={search} view={view.kind}
              sort={sort} onSort={setSort} onSelect={(id) => nav(`/notes/${id}`)} onCreate={createNote} creating={creating} onRetry={reload} />
          </div>
          <main className={`${noteId ? 'block' : 'hidden'} min-w-0 flex-1 md:block`}>
            {active
              ? <NoteEditor key={active.id} note={active} onSave={save} onBack={() => nav('/notes')} onDelete={() => setConfirmDelete(true)} />
              : <div className="p-6">{loading ? null : <EmptyState>{noteId ? 'This note no longer exists.' : 'Select a note to view it, or create a new one.'}</EmptyState>}</div>}
          </main>
        </div>
      </div>
      <ConfirmationDialog open={confirmDelete} title="Delete Note" busy={deleting} confirmLabel="Delete Note"
        message="Are you sure you want to permanently delete this note? This action cannot be undone."
        onConfirm={doDelete} onCancel={() => setConfirmDelete(false)} />
    </div>
  )
}
