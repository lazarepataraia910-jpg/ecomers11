import { useEffect, useRef } from 'react'

interface Props { open: boolean; title: string; message: string; confirmLabel: string; busy?: boolean; onConfirm: () => void; onCancel: () => void }

export function ConfirmationDialog({ open, title, message, confirmLabel, busy, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onCancel() }} className="w-[calc(100%-32px)] max-w-md rounded-xl border border-n-200 p-0 backdrop:bg-n-950/50">
      <div className="p-5">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-n-600">{message}</p>
      </div>
      <div className="flex justify-end gap-3 border-t border-n-200 p-4">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn-danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : confirmLabel}</button>
      </div>
    </dialog>
  )
}
