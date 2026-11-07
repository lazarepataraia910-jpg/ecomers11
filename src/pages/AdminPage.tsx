import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, Trash2 } from 'lucide-react'
import { SearchBar } from '../components/SearchBar'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../components/ToastNotification'
import { useAuth } from '../hooks/useAuth'
import { adminService } from '../services'
import { formatDate } from '../lib/format'
import type { AdminData, AdminNote } from '../lib/types'

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl border border-n-200 bg-white p-4">
    <p className="text-sm text-n-600">{label}</p>
    <p className="mt-1 text-2xl font-semibold">{value}</p>
  </div>
)
const th = 'px-4 py-3 text-left text-xs font-medium uppercase text-n-500'
const td = 'px-4 py-3 text-sm'

export default function AdminPage() {
  const { user, signOut } = useAuth()
  const nav = useNavigate()
  const toast = useToast()
  const [data, setData] = useState<AdminData | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [target, setTarget] = useState<AdminNote | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setError('')
    adminService.load().then(setData).catch((e: Error) => setError(e.message))
  }
  useEffect(load, [])

  const notes = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (data?.notes ?? []).filter((n) => !q || [n.title, n.content, n.owner_email].some((v) => v.toLowerCase().includes(q)))
  }, [data, search])

  async function confirmDelete() {
    if (!target) return
    setDeleting(true)
    try { await adminService.deleteNote(target.id); toast('Note deleted'); load() }
    catch (e) { toast((e as Error).message, 'error') }
    finally { setDeleting(false); setTarget(null) }
  }

  return (
    <div className="min-h-screen bg-n-50">
      <header className="flex items-center gap-3 border-b border-n-200 bg-white px-4 py-4 lg:px-8">
        <Link to="/notes" className="btn-secondary px-3" aria-label="Back to notes"><ArrowLeft size={16} /></Link>
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <span className="ml-auto hidden truncate text-sm text-n-600 sm:block">{user?.email}</span>
        <button type="button" className="btn-secondary ml-auto px-3 sm:ml-0" aria-label="Log out" onClick={async () => { await signOut(); nav('/login') }}><LogOut size={16} /></button>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 p-4 lg:p-8">
        {error && (
          <div role="alert" className="space-y-2 rounded-lg border border-danger bg-white p-4 text-sm">
            <p className="text-danger">{error}</p>
            <p className="text-n-600">If this says a table or policy is missing, run <code>supabase/admin.sql</code> in Supabase.</p>
            <button type="button" className="btn-secondary" onClick={load}>Try again</button>
          </div>
        )}
        {!data && !error && <p className="text-sm text-n-600">Loading…</p>}
        {data && (
          <>
            <section aria-label="Statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Stat label="Users" value={data.users.length} />
              <Stat label="Notes" value={data.notes.length} />
              <Stat label="Archived notes" value={data.notes.filter((n) => n.archived).length} />
            </section>

            <section aria-labelledby="users-h">
              <h2 id="users-h" className="mb-3 text-base font-semibold">Users</h2>
              <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
                <table className="w-full min-w-[480px]">
                  <thead className="border-b border-n-200"><tr><th className={th}>Email</th><th className={th}>Registered</th><th className={th}>Notes</th></tr></thead>
                  <tbody className="divide-y divide-n-200">
                    {data.users.map((u) => (
                      <tr key={u.id}><td className={td}>{u.email}</td><td className={td}>{u.created_at ? formatDate(u.created_at) : '—'}</td><td className={td}>{u.note_count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="notes-h">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 id="notes-h" className="text-base font-semibold">All notes</h2>
                <SearchBar value={search} onChange={setSearch} />
              </div>
              {notes.length === 0 ? (
                <EmptyState>{search ? `No notes match “${search}”.` : 'There are no notes yet.'}</EmptyState>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
                  <table className="w-full min-w-[640px]">
                    <thead className="border-b border-n-200"><tr><th className={th}>Title</th><th className={th}>Owner</th><th className={th}>Updated</th><th className={th}><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody className="divide-y divide-n-200">
                      {notes.map((n) => (
                        <tr key={n.id}>
                          <td className={`${td} max-w-xs truncate`}>{n.title || 'Untitled Note'}{n.archived && <span className="ml-2 rounded bg-n-200 px-1.5 py-0.5 text-xs">Archived</span>}</td>
                          <td className={td}>{n.owner_email}</td>
                          <td className={td}>{formatDate(n.updated_at)}</td>
                          <td className={`${td} text-right`}>
                            <button type="button" className="btn-secondary px-3 py-2" aria-label={`Delete note ${n.title || 'Untitled Note'}`} onClick={() => setTarget(n)}><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <ConfirmationDialog open={!!target} busy={deleting} title="Delete Note" confirmLabel="Delete Note"
        message={`Permanently delete “${target?.title || 'Untitled Note'}” owned by ${target?.owner_email}? This cannot be undone.`}
        onConfirm={confirmDelete} onCancel={() => setTarget(null)} />
    </div>
  )
}
