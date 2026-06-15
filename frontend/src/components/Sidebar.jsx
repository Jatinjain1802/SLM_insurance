// components/Sidebar.jsx
// LEARNING NOTE:
// This is a React component — a function that returns JSX (HTML-like syntax).
// We use React Router's <NavLink> which automatically adds an "active"
// class when the current URL matches the link's path.
// useNavigate() lets us redirect the user programmatically (on logout).

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Navigation items — each has a path, icon (emoji), and label
// Grouped into sections for visual clarity
const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard',     icon: '📊', label: 'Dashboard' },
    ]
  },
  {
    label: 'Management',
    items: [
      { path: '/customers',     icon: '👥', label: 'Customers' },
      { path: '/policies',      icon: '📋', label: 'Policies' },
      { path: '/premiums',      icon: '💰', label: 'Premiums' },
      { path: '/companies',     icon: '🏢', label: 'Companies' },
    ]
  },
  {
    label: 'Documents & Reports',
    items: [
      { path: '/documents',     icon: '📁', label: 'Documents' },
      { path: '/reports',       icon: '📈', label: 'Reports' },
    ]
  },
  {
    label: 'Communication',
    items: [
      { path: '/notifications', icon: '🔔', label: 'Notifications' },
    ]
  },
  {
    label: 'System',
    items: [
      { path: '/settings',      icon: '⚙️', label: 'Settings' },
    ]
  }
]

function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Get the user's initials for the avatar (e.g., "Rahul Sharma" → "RS")
  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = () => {
    logout()           // Clear the auth context + localStorage
    navigate('/login') // Redirect to login page
  }

  return (
    <aside className="sidebar">
      {/* ---- Logo / Brand ---- */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🛡️</div>
        <div className="sidebar-logo-text">
          <span className="brand">SLM Insurance</span>
          <span className="tagline">CRM Platform</span>
        </div>
      </div>

      {/* ---- Navigation Links ---- */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => (
              // NavLink automatically adds className="active" when the URL matches
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ---- User Info + Logout ---- */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
          <div className="sidebar-avatar">
            {getInitials(user?.name || 'U')}
          </div>
          <div className="sidebar-user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role || 'Staff'} · Logout</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
