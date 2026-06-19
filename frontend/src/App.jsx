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

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import Loader from './components/Loader'
import { FiAlertCircle } from 'react-icons/fi'

// Pages (Lazy Loaded)
const LoginPage           = lazy(() => import('./pages/LoginPage'))
const DashboardPage       = lazy(() => import('./pages/DashboardPage'))
const CustomersPage       = lazy(() => import('./pages/CustomersPage'))
const CustomerDetailPage  = lazy(() => import('./pages/CustomerDetailPage'))
const PoliciesPage        = lazy(() => import('./pages/PoliciesPage'))
const PremiumsPage        = lazy(() => import('./pages/PremiumsPage'))
const CompaniesPage       = lazy(() => import('./pages/CompaniesPage'))
const DocumentsPage       = lazy(() => import('./pages/DocumentsPage'))
const ReportsPage         = lazy(() => import('./pages/ReportsPage'))
const NotificationsPage   = lazy(() => import('./pages/NotificationsPage'))
const SettingsPage        = lazy(() => import('./pages/SettingsPage'))

// ProtectedRoute: wraps pages that require login
// Redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
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
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public route — redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
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
          <FiAlertCircle size={64} color="var(--primary-500)" />
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>404</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Page not found</p>
          <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
        </div>
      } />
    </Routes>
  </Suspense>
  )
}

// Root App component — wraps everything with AuthProvider and BrowserRouter
function App() {
  return (
    // ThemeProvider makes light/dark mode available everywhere
    <ThemeProvider>
      {/* AuthProvider makes auth state available everywhere */}
      <AuthProvider>
        {/* BrowserRouter enables URL-based routing */}
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
