// pages/DashboardPage.jsx
// LEARNING NOTE:
// useEffect runs code AFTER the component renders.
// Here we use it to fetch dashboard stats when the page loads.
// The empty [] dependency array means "run once on mount" (like componentDidMount).
// Recharts: AreaChart, BarChart, PieChart are chart components from the recharts library.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import StatCard from '../components/StatCard'
import { dashboardAPI } from '../services/api'

// ---- Mock data (used until backend is connected) ----
const MOCK_STATS = {
  totalCustomers: 248,
  activePolicies: 312,
  expiredPolicies: 47,
  dueSoon: 23,
  monthlyRevenue: 184500,
  totalPremium: 2340000,
}

const REVENUE_DATA = [
  { month: 'Jan', revenue: 142000 },
  { month: 'Feb', revenue: 158000 },
  { month: 'Mar', revenue: 134000 },
  { month: 'Apr', revenue: 172000 },
  { month: 'May', revenue: 165000 },
  { month: 'Jun', revenue: 184500 },
]

const POLICY_TYPE_DATA = [
  { name: 'Life', value: 42, color: '#3b82f6' },
  { name: 'Health', value: 28, color: '#22c55e' },
  { name: 'Vehicle', value: 20, color: '#f59e0b' },
  { name: 'Travel', value: 10, color: '#8b5cf6' },
]

const RENEWAL_DATA = [
  { month: 'Jan', renewed: 28, expired: 8 },
  { month: 'Feb', renewed: 35, expired: 5 },
  { month: 'Mar', renewed: 30, expired: 10 },
  { month: 'Apr', renewed: 42, expired: 6 },
  { month: 'May', renewed: 38, expired: 9 },
  { month: 'Jun', renewed: 45, expired: 4 },
]

const RECENT_CUSTOMERS = [
  { name: 'Rahul Sharma',   mobile: '9876543210', policies: 3, date: '12 Jun 2026' },
  { name: 'Priya Patel',    mobile: '9123456780', policies: 2, date: '11 Jun 2026' },
  { name: 'Amit Verma',     mobile: '9988776655', policies: 1, date: '10 Jun 2026' },
  { name: 'Sunita Joshi',   mobile: '9001234567', policies: 4, date: '09 Jun 2026' },
  { name: 'Deepak Malhotra', mobile: '9812345670', policies: 2, date: '08 Jun 2026' },
]

const QUICK_ACTIONS = [
  { icon: '👤', label: 'Add Customer',    path: '/customers' },
  { icon: '📋', label: 'Add Policy',      path: '/policies' },
  { icon: '📁', label: 'Upload Document', path: '/documents' },
  { icon: '🔔', label: 'Send Reminder',   path: '/notifications' },
  { icon: '📈', label: 'View Reports',    path: '/reports' },
]

function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(MOCK_STATS)
  const [loading, setLoading] = useState(false)

  // Fetch real stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.getStats()
        setStats(res.data)
      } catch {
        // If backend not ready, mock data is already set
      }
    }
    fetchStats()
  }, []) // [] = run once when component mounts

  const formatCurrency = (num) =>
    '₹' + Number(num).toLocaleString('en-IN')

  return (
    <div className="page-container page-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your business overview.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/customers')}
        >
          + Add Customer
        </button>
      </div>

      {/* ---- Stats Grid ---- */}
      <div className="stats-grid">
        <StatCard
          label="Total Customers"
          value={stats.totalCustomers}
          icon="👥"
          color="blue"
          change="12% this month"
          changeType="up"
        />
        <StatCard
          label="Active Policies"
          value={stats.activePolicies}
          icon="✅"
          color="green"
          change="8% this month"
          changeType="up"
        />
        <StatCard
          label="Expiring Soon"
          value={stats.dueSoon}
          icon="⏰"
          color="orange"
          change="Needs attention"
          changeType="down"
        />
        <StatCard
          label="Expired Policies"
          value={stats.expiredPolicies}
          icon="❌"
          color="red"
        />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon="💰"
          color="teal"
          change="6% this month"
          changeType="up"
        />
        <StatCard
          label="Total Premium"
          value={formatCurrency(stats.totalPremium)}
          icon="📊"
          color="purple"
        />
      </div>

      {/* ---- Quick Actions ---- */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Quick Actions</div>
            <div className="card-subtitle">Common tasks at a glance</div>
          </div>
        </div>
        <div className="quick-actions">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.path}
              className="quick-action-btn"
              onClick={() => navigate(action.path)}
            >
              <span className="quick-action-icon">{action.icon}</span>
              <span className="quick-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ---- Charts Row 1 ---- */}
      <div className="charts-grid">
        {/* Revenue Trend */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Trend</div>
              <div className="card-subtitle">Monthly premium collection (₹)</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Policy Distribution (Pie) */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Policy Distribution</div>
              <div className="card-subtitle">By insurance type</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={POLICY_TYPE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {POLICY_TYPE_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                formatter={(v) => [`${v}%`, 'Share']}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- Charts Row 2 ---- */}
      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        {/* Renewal vs Expired */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Renewal Trend</div>
              <div className="card-subtitle">Renewed vs Expired policies</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={RENEWAL_DATA} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Bar dataKey="renewed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Renewed" />
              <Bar dataKey="expired" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expired" />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Customers */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Customers</div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers')}>
              View All
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobile</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Policies</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Added</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_CUSTOMERS.map((c) => (
                  <tr key={c.mobile} style={{ borderTop: '1px solid var(--bg-border)', cursor: 'pointer' }} onClick={() => navigate('/customers')}>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{c.mobile}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px' }}>
                      <span className="badge badge-active">{c.policies}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
