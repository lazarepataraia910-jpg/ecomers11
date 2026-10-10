import { formatDate } from '../lib/format'
import type { Note } from '../lib/types'

export function NoteCard({ note, active, onSelect }: { note: Note; active: boolean; onSelect: () => void }) {
  return (
    <li>
      <button type="button" onClick={onSelect} aria-current={active}
        className={`w-full rounded-lg p-2.5 text-left ${active ? 'bg-n-100' : 'hover:bg-n-50'}`}>
        <h3 className="truncate text-base font-semibold">{note.title || 'Untitled Note'}</h3>
        {note.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {note.tags.map((t) => <span key={t} className="rounded bg-n-200 px-1.5 py-0.5 text-xs">{t}</span>)}
          </div>
        )}
        <p className="mt-2 text-xs text-n-700"><span className="sr-only">Last updated </span>{formatDate(note.updated_at)}</p>
      </button>
    </li>
  )
}
