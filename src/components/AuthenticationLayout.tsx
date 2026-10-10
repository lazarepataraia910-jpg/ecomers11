import type { ReactNode } from 'react'
import { NotebookPen } from 'lucide-react'

export function AuthenticationLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-n-100 px-4 py-10">
      <div className="w-full max-w-[540px] rounded-xl border border-n-200 bg-white px-5 py-10 shadow-card sm:px-12">
        <div className="flex items-center justify-center gap-2 text-primary">
          <NotebookPen size={28} aria-hidden /> <span className="text-2xl font-semibold text-n-950">Notes</span>
        </div>
        <h1 className="mt-4 text-center text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-center text-sm text-n-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 border-t border-n-200 pt-6 text-center text-sm text-n-600">{footer}</p>
      </div>
    </main>
  )
}
