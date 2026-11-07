import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'

function Gate({ children, requireAuth }: { children: ReactElement; requireAuth: boolean }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-8 text-sm text-n-600">Loading…</p>
  if (requireAuth && !user) return <Navigate to="/login" replace />
  if (!requireAuth && user) return <Navigate to="/notes" replace />
  return children
}

function AdminGate({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-8 text-sm text-n-600">Loading…</p>
  if (!user) return <Navigate to="/login" replace />
  if (!user.isAdmin) return <Navigate to="/notes" replace />
  return children
}

// Visitors who are not signed in land on registration; signed-in users go to their notes.
function Home() {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-8 text-sm text-n-600">Loading…</p>
  return <Navigate to={user ? '/notes' : '/register'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<Gate requireAuth={false}><RegisterPage /></Gate>} />
      <Route path="/login" element={<Gate requireAuth={false}><LoginPage /></Gate>} />
      <Route path="/admin" element={<AdminGate><AdminPage /></AdminGate>} />
      <Route path="/notes/:noteId?" element={<Gate requireAuth><DashboardPage /></Gate>} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
