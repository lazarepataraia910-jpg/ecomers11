import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'

function Gate({ children, requireAuth }: { children: ReactElement; requireAuth: boolean }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-8 text-sm text-n-600">Loading…</p>
  if (requireAuth && !user) return <Navigate to="/login" replace />
  if (!requireAuth && user) return <Navigate to="/notes" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<Gate requireAuth={false}><RegisterPage /></Gate>} />
      <Route path="/login" element={<Gate requireAuth={false}><LoginPage /></Gate>} />
      <Route path="/notes/:noteId?" element={<Gate requireAuth><DashboardPage /></Gate>} />
      <Route path="*" element={<Navigate to="/notes" replace />} />
    </Routes>
  )
}
