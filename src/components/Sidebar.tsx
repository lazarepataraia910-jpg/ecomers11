import { Archive, ChevronRight, FileText, NotebookPen, Tag, X } from 'lucide-react'

export type View = { kind: 'all' } | { kind: 'archived' } | { kind: 'tag'; tag: string }
export const viewKey = (v: View) => (v.kind === 'tag' ? `tag:${v.tag}` : v.kind)

interface Props { view: View; tags: string[]; open: boolean; onSelect: (v: View) => void; onClose: () => void }

export function Sidebar({ view, tags, open, onSelect, onClose }: Props) {
  const item = (active: boolean) =>
    `flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${active ? 'bg-n-100 font-medium' : 'text-n-700 hover:bg-n-50'}`
  const pick = (v: View) => { onSelect(v); onClose() }
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-n-950/40 lg:hidden" onClick={onClose} aria-hidden />}
      <aside aria-label="Navigation" className={`fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-n-200 bg-white p-4 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center justify-between px-1">
          <span className="flex items-center gap-2 text-xl font-semibold"><NotebookPen className="text-primary" /> Notes</span>
          <button type="button" className="rounded p-1 lg:hidden" aria-label="Close navigation" onClick={onClose}><X size={20} /></button>
        </div>
        <nav className="space-y-1">
          <button type="button" className={item(view.kind === 'all')} aria-current={view.kind === 'all'} onClick={() => pick({ kind: 'all' })}>
            <FileText size={18} className={view.kind === 'all' ? 'text-primary' : ''} /> All Notes {view.kind === 'all' && <ChevronRight size={16} className="ml-auto" />}
          </button>
          <button type="button" className={item(view.kind === 'archived')} aria-current={view.kind === 'archived'} onClick={() => pick({ kind: 'archived' })}>
            <Archive size={18} className={view.kind === 'archived' ? 'text-primary' : ''} /> Archived Notes {view.kind === 'archived' && <ChevronRight size={16} className="ml-auto" />}
          </button>
        </nav>
        <div className="mt-4 border-t border-n-200 pt-4">
          <h2 className="mb-2 px-3 text-sm text-n-500">Tags</h2>
          {tags.length === 0 && <p className="px-3 text-sm text-n-500">No tags yet</p>}
          <ul className="space-y-1">
            {tags.map((t) => {
              const active = view.kind === 'tag' && view.tag === t
              return (
                <li key={t}>
                  <button type="button" className={item(active)} aria-current={active} onClick={() => pick({ kind: 'tag', tag: t })}>
                    <Tag size={18} className={active ? 'text-primary' : ''} /> <span className="truncate">{t}</span>
                    {active && <ChevronRight size={16} className="ml-auto" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>
    </>
  )
}
