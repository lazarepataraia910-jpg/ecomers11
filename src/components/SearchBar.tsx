import { Search } from 'lucide-react'
export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-full max-w-xs">
      <Search size={18} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-n-500" />
      <input type="search" aria-label="Search notes by title or content" placeholder="Search by title or content…"
        value={value} onChange={(e) => onChange(e.target.value)} className="input pl-10" />
    </div>
  )
}
