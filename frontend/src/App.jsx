// App.jsx
// LEARNING NOTE:
// React Router v6 manages navigation between pages without page refresh.
// <BrowserRouter> wraps the app and enables routing.
// <Routes> is the container for all route definitions.
// <Route path="/dashboard" element={<DashboardPage />} /> maps a URL to a component.
//
// ProtectedRoute is a wrapper that:
//   - If user IS logged in → show the page
//   - If user is NOT logged in → redirect to /login
// This prevents unauthorized access to dashboard pages.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'

// Pages
import LoginPage           from './pages/LoginPage'
import DashboardPage       from './pages/DashboardPage'
import CustomersPage       from './pages/CustomersPage'
import CustomerDetailPage  from './pages/CustomerDetailPage'
import PoliciesPage        from './pages/PoliciesPage'
import PremiumsPage        from './pages/PremiumsPage'
import CompaniesPage       from './pages/CompaniesPage'
import DocumentsPage       from './pages/DocumentsPage'
import ReportsPage         from './pages/ReportsPage'
import NotificationsPage   from './pages/NotificationsPage'
import SettingsPage        from './pages/SettingsPage'

// ======================================================
// DEMO_MODE: set to true to skip login and view all pages
// Set to false when backend is ready and auth is wired up
// ======================================================
const DEMO_MODE = false

// ProtectedRoute: wraps pages that require login
// In DEMO_MODE → always allows access
// In production → redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (DEMO_MODE) return children  // ← remove this line when backend is ready
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// AppLayout: the shell with Sidebar + main content area
// Only shown on protected/authenticated pages
function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public route — redirect to dashboard if already logged in */}
      {/* In DEMO_MODE, /login still works but root goes straight to dashboard */}
      <Route
        path="/login"
        element={DEMO_MODE ? <Navigate to="/dashboard" replace /> : (isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />)}
      />

      {/* Protected routes — require login */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/customers" element={
        <ProtectedRoute>
          <AppLayout><CustomersPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/customers/:id" element={
        <ProtectedRoute>
          <AppLayout><CustomerDetailPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/policies" element={
        <ProtectedRoute>
          <AppLayout><PoliciesPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/premiums" element={
        <ProtectedRoute>
          <AppLayout><PremiumsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/companies" element={
        <ProtectedRoute>
          <AppLayout><CompaniesPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/documents" element={
        <ProtectedRoute>
          <AppLayout><DocumentsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute>
          <AppLayout><ReportsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppLayout><NotificationsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout><SettingsPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Default: redirect root to dashboard (or login if not authenticated) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 catch-all */}
      <Route path="*" element={
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', gap: '16px',
          background: 'var(--bg-base)', color: 'var(--text-primary)'
        }}>
          <div style={{ fontSize: 64 }}>🔍</div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>404</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Page not found</p>
          <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
        </div>
      } />
    </Routes>
  )
}

// Root App component — wraps everything with AuthProvider and BrowserRouter
function App() {
  return (
    // AuthProvider makes auth state available everywhere
    <AuthProvider>
      {/* BrowserRouter enables URL-based routing */}
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
