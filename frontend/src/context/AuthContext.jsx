// AuthContext.jsx
// LEARNING NOTE:
// React Context API lets you share data (like "who is logged in")
// across ALL components without passing it as props every time.
//
// Think of it like a global variable that React manages for you.
// Any component that calls useAuth() gets access to the user info.

import { createContext, useContext, useState, useEffect } from 'react'

// Step 1: Create a context object. This is like creating the "container"
// that will hold our shared data.
const AuthContext = createContext(null)

// Step 2: AuthProvider wraps our entire app and provides the shared data.
// Any component inside AuthProvider can access the auth data.
export function AuthProvider({ children }) {
  // useState stores the currently logged-in user
  // We try to get saved user from localStorage (so login persists on refresh)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('slm_user')
    return saved ? JSON.parse(saved) : null
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('slm_token') || null
  })

  // login() — called when user submits the login form
  // Receives { user, token } from the API response
  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    // Save to localStorage so the user stays logged in after refresh
    localStorage.setItem('slm_user', JSON.stringify(userData))
    localStorage.setItem('slm_token', authToken)
  }

  // logout() — clears everything
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('slm_user')
    localStorage.removeItem('slm_token')
  }

  // isAuthenticated — simple boolean: true if we have a token
  const isAuthenticated = !!token

  // The "value" object is what all children components can access
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

// Step 3: Custom hook — makes it easy to use auth anywhere.
// Instead of: const auth = useContext(AuthContext)
// You just write: const { user, login, logout } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return context
}
