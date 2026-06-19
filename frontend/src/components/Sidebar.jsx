// components/Sidebar.jsx
// LEARNING NOTE:
// This is a React component — a function that returns JSX (HTML-like syntax).
// We use React Router's <NavLink> which automatically adds an "active"
// class when the current URL matches the link's path.
// useNavigate() lets us redirect the user programmatically (on logout).

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { 
  FiPieChart, FiUsers, FiFileText, FiDollarSign, 
  FiBriefcase, FiFolder, FiTrendingUp, FiBell, 
  FiSettings, FiShield, FiSun, FiMoon
} from 'react-icons/fi'

// Navigation items — each has a path, icon (component), and label
// Grouped into sections for visual clarity
const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard',     icon: <FiPieChart />, label: 'Dashboard' },
    ]
  },
  {
    label: 'Management',
    items: [
      { path: '/customers',     icon: <FiUsers />, label: 'Customers' },
      { path: '/policies',      icon: <FiFileText />, label: 'Policies' },
      { path: '/premiums',      icon: <FiDollarSign />, label: 'Premiums' },
      { path: '/companies',     icon: <FiBriefcase />, label: 'Companies' },
    ]
  },
  {
    label: 'Documents & Reports',
    items: [
      { path: '/documents',     icon: <FiFolder />, label: 'Documents' },
      { path: '/reports',       icon: <FiTrendingUp />, label: 'Reports' },
    ]
  },
  {
    label: 'Communication',
    items: [
      { path: '/notifications', icon: <FiBell />, label: 'Notifications' },
    ]
  },
  {
    label: 'System',
    items: [
      { path: '/settings',      icon: <FiSettings />, label: 'Settings' },
    ]
  }
]

function Sidebar() {
  const { user: authUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  // In demo mode there's no logged-in user, so we use a placeholder
  const user = authUser || { name: 'Demo Owner', role: 'owner' }
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
      <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', marginBottom: '10px' }}>
        <div style={{ 
          background: theme === 'dark' ? 'rgba(255,255,255,0.95)' : 'transparent',
          padding: theme === 'dark' ? '8px 16px' : '0',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}>
          <img 
            src="/SLM_Logo.png" 
            alt="SLM Financial Services" 
            style={{ width: '100%', maxWidth: '160px', objectFit: 'contain' }} 
          />
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

      {/* ---- User Info + Theme Toggle + Logout ---- */}
      <div className="sidebar-footer">
        {/* Theme Toggle Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Theme</span>
          <button className="btn-icon" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
          </button>
        </div>

        {/* User Info & Logout */}
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
