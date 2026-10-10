import type { ReactNode } from 'react'
export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-n-200 bg-n-100 p-3 text-sm text-n-950">{children}</div>
}
