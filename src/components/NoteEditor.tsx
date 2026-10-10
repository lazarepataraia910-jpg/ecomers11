import { useEffect, useRef, useState } from 'react'
import { Archive, ArchiveRestore, ArrowLeft, Clock, Tag, Trash2 } from 'lucide-react'
import type { Note, NoteInput } from '../lib/types'
import { formatDate } from '../lib/format'

interface Props {
  note: Note
  onSave: (id: string, patch: NoteInput) => Promise<unknown>
  onDelete: () => void
  onBack: () => void
}
type Status = 'saved' | 'dirty' | 'saving' | 'error'

const parseTags = (s: string) => [...new Set(s.split(',').map((t) => t.trim()).filter(Boolean))]

/** Mount with key={note.id}: local draft state resets per note and unsaved edits flush on unmount. */
export function NoteEditor({ note, onSave, onDelete, onBack }: Props) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tags, setTags] = useState(note.tags.join(', '))
  const [status, setStatus] = useState<Status>('saved')

  const saved = useRef({ title: note.title, content: note.content, tags: note.tags.join(', ') })
  const draft = useRef(saved.current)
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave
  const timer = useRef<number | undefined>(undefined)
  const inflight = useRef(false)

  const isDirty = () => JSON.stringify(draft.current) !== JSON.stringify(saved.current)

  async function flush() {
    window.clearTimeout(timer.current)
    if (!isDirty() || inflight.current) return
    const d = draft.current
    inflight.current = true
    setStatus('saving')
    try {
      await onSaveRef.current(note.id, { title: d.title, content: d.content, tags: parseTags(d.tags) })
      saved.current = d
      setStatus(isDirty() ? 'dirty' : 'saved')
    } catch {
      setStatus('error')
    } finally {
      inflight.current = false
      if (isDirty()) timer.current = window.setTimeout(flush, 1500)
    }
  }

  function change(next: Partial<typeof draft.current>) {
    draft.current = { ...draft.current, ...next }
    setStatus('dirty')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(flush, 800)
  }

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (isDirty() || inflight.current) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => {
      window.removeEventListener('beforeunload', warn)
      window.clearTimeout(timer.current)
      if (isDirty()) {
        const d = draft.current
        void onSaveRef.current(note.id, { title: d.title, content: d.content, tags: parseTags(d.tags) }).catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const label = { saved: 'All changes saved', dirty: 'Unsaved changes…', saving: 'Saving…', error: 'Save failed. Retrying…' }[status]

  return (
    <section aria-label="Note editor" className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-n-200 px-4 py-3">
        <button type="button" className="btn-secondary px-3 lg:hidden" onClick={() => { void flush(); onBack() }} aria-label="Back to notes"><ArrowLeft size={16} /></button>
        <p role="status" className={`text-sm ${status === 'error' ? 'text-danger' : 'text-n-600'}`}>{label}</p>
        <div className="ml-auto flex gap-2">
          <button type="button" className="btn-secondary px-3" aria-label={note.archived ? 'Restore note' : 'Archive note'}
            onClick={() => onSave(note.id, { archived: !note.archived })}>
            {note.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}<span className="hidden sm:inline">{note.archived ? 'Restore' : 'Archive'}</span>
          </button>
          <button type="button" className="btn-secondary px-3" aria-label="Delete note" onClick={onDelete}><Trash2 size={16} /><span className="hidden sm:inline">Delete</span></button>
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4 lg:p-6">
        <input aria-label="Note title" placeholder="Enter a title…" value={title}
          onChange={(e) => { setTitle(e.target.value); change({ title: e.target.value }) }}
          className="w-full rounded-lg bg-transparent text-2xl font-semibold placeholder:text-n-400 focus:outline-none focus-visible:shadow-focus" />
        <dl className="space-y-3 border-b border-n-200 pb-4 text-sm">
          <div className="flex items-center gap-4">
            <dt className="flex w-28 items-center gap-2 text-n-600"><Tag size={16} /> Tags</dt>
            <dd className="flex-1"><input aria-label="Tags, comma separated" placeholder="Add tags separated by commas (e.g. Work, Ideas)" value={tags}
              onChange={(e) => { setTags(e.target.value); change({ tags: e.target.value }) }} className="input !py-2" /></dd>
          </div>
          <div className="flex items-center gap-4">
            <dt className="flex w-28 items-center gap-2 text-n-600"><Clock size={16} /> Last edited</dt>
            <dd>{formatDate(note.updated_at)}</dd>
          </div>
        </dl>
        <textarea aria-label="Note content" placeholder="Start typing your note here…" value={content}
          onChange={(e) => { setContent(e.target.value); change({ content: e.target.value }) }}
          className="min-h-[300px] w-full resize-none rounded-lg bg-transparent text-sm leading-6 placeholder:text-n-400 focus:outline-none focus-visible:shadow-focus" />
      </div>
    </section>
  )
}
