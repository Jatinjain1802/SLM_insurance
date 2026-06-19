// pages/LoginPage.jsx
// LEARNING NOTE:
// useState manages form input values. When the user types, we update state.
// When form is submitted, we call the API, get a token, and store it via login().
// useNavigate() redirects to dashboard after successful login.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiShield, FiAlertTriangle } from 'react-icons/fi'
import { authAPI } from '../services/api'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Form state
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // handleChange updates the correct field in the form object
  // [e.target.name] is computed property — it uses the input's name attribute
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // handleSubmit sends the login request to our backend
  const handleSubmit = async (e) => {
    e.preventDefault() // Prevents the page from reloading (default form behavior)
    setError('')
    setLoading(true)

    try {
      // Call POST /api/auth/login
      const response = await authAPI.login(form)
      const { user, token } = response.data

      // Save user and token to context + localStorage
      login(user, token)

      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      // Show error message from backend, or a generic one
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Demo login — fills in test credentials for quick access
  const handleDemoLogin = () => {
    setForm({ email: 'admin@slm.com', password: 'password123' })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon"><FiShield /></div>
          <h1>SLM Insurance</h1>
          <p>Sign in to your CRM dashboard</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiAlertTriangle /> {error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address <span className="form-required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="owner@slm.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password <span className="form-required">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : '→ Sign In'}
          </button>
        </form>

        {/* Demo button */}
        <button
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}
          onClick={handleDemoLogin}
        >
          Fill Demo Credentials
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
          SLM Insurance CRM · Secure Login
        </p>
      </div>
    </div>
  )
}

export default LoginPage
