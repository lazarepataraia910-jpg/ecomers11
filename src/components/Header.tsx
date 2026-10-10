import { LogOut, Menu } from 'lucide-react'
import { SearchBar } from './SearchBar'

interface Props { title: string; search: string; onSearch: (v: string) => void; onMenu: () => void; onSignOut: () => void; email: string }
export function Header({ title, search, onSearch, onMenu, onSignOut, email }: Props) {
  return (
    <header className="flex items-center gap-3 border-b border-n-200 bg-white px-4 py-4 lg:px-8">
      <button type="button" className="rounded-lg p-2 text-n-600 hover:bg-n-100 lg:hidden" aria-label="Open navigation" onClick={onMenu}><Menu size={20} /></button>
      <h1 className="hidden truncate text-xl font-semibold sm:block">{title}</h1>
      <div className="ml-auto flex w-full items-center justify-end gap-3 sm:w-auto sm:flex-1">
        <SearchBar value={search} onChange={onSearch} />
        <span className="hidden max-w-[180px] truncate text-sm text-n-600 xl:block" title={email}>{email}</span>
        <button type="button" className="btn-secondary px-3" onClick={onSignOut} aria-label="Log out"><LogOut size={16} /><span className="hidden md:inline">Logout</span></button>
      </div>
    </header>
  )
}
