import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppLayout } from './components/AppLayout'
import { RequireRole } from './components/RequireRole'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { CasesListPage } from './pages/CasesListPage'
import { CaseNewPage } from './pages/CaseNewPage'
import { CaseDetailPage } from './pages/CaseDetailPage'
import { EvidenceCasePage } from './pages/EvidenceCasePage'
import { UsersPage } from './pages/UsersPage'
import { CustodyPage } from './pages/CustodyPage'
import { AuditPage } from './pages/AuditPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, user, loading } = useAuth()

  if (!token) {
    return (
      <Navigate to="/login" replace state={{ from: window.location.pathname }} />
    )
  }

  if (loading && !user) {
    return (
      <div className="shell">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="cases" element={<CasesListPage />} />
        <Route
          path="cases/new"
          element={
            <RequireRole roles={['inspector']}>
              <CaseNewPage />
            </RequireRole>
          }
        />
        <Route path="cases/:caseId" element={<CaseDetailPage />} />
        <Route path="evidence/:caseId" element={<EvidenceCasePage />} />
        <Route
          path="users"
          element={
            <RequireRole roles={['admin']}>
              <UsersPage />
            </RequireRole>
          }
        />
        <Route path="custody" element={<CustodyPage />} />
        <Route
          path="audit"
          element={
            <RequireRole roles={['admin']}>
              <AuditPage />
            </RequireRole>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
