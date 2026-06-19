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
import { FiUserPlus, FiFilePlus, FiUploadCloud, FiBell, FiCheckCircle, FiXCircle, FiDollarSign, FiTrendingUp, FiUsers, FiClock, FiBarChart2 } from 'react-icons/fi'

const INITIAL_STATS = {
  totalCustomers: 0,
  activePolicies: 0,
  expiredPolicies: 0,
  dueSoon: 0,
  monthlyRevenue: 0,
  totalPremium: 0,
  chartData: {
    revenueData: [],
    policyTypeData: [],
    renewalData: [],
    recentCustomers: []
  }
}

const QUICK_ACTIONS = [
  { icon: <FiUserPlus />, label: 'Add Customer',    path: '/customers' },
  { icon: <FiFilePlus />, label: 'Add Policy',      path: '/policies' },
  { icon: <FiUploadCloud />, label: 'Upload Document', path: '/documents' },
  { icon: <FiBell />, label: 'Send Reminder',   path: '/notifications' },
  { icon: <FiTrendingUp />, label: 'View Reports',    path: '/reports' },
]

function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(INITIAL_STATS)
  const [loading, setLoading] = useState(false)

  // Fetch real stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.getStats()
        if (res.data.chartData) {
          setStats(res.data)
        }
      } catch {
        // Fallback to initial state
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
          icon={<FiUsers />}
          color="blue"
          change="12% this month"
          changeType="up"
          onClick={() => navigate('/customers')}
        />
        <StatCard
          label="Active Policies"
          value={stats.activePolicies}
          icon={<FiCheckCircle />}
          color="green"
          change="8% this month"
          changeType="up"
          onClick={() => navigate('/policies')}
        />
        <StatCard
          label="Expiring Soon"
          value={stats.dueSoon}
          icon={<FiClock />}
          color="orange"
          change="Needs attention"
          changeType="down"
          onClick={() => navigate('/policies')}
        />
        <StatCard
          label="Expired Policies"
          value={stats.expiredPolicies}
          icon={<FiXCircle />}
          color="red"
          onClick={() => navigate('/policies')}
        />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={<FiDollarSign />}
          color="teal"
          change="6% this month"
          changeType="up"
          onClick={() => navigate('/reports')}
        />
        <StatCard
          label="Total Premium"
          value={formatCurrency(stats.totalPremium)}
          icon={<FiBarChart2 />}
          color="purple"
          onClick={() => navigate('/reports')}
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
            <AreaChart data={stats.chartData.revenueData}>
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
                data={stats.chartData.policyTypeData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {stats.chartData.policyTypeData.map((entry) => (
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
              <div className="card-title">Policy Status Trend</div>
              <div className="card-subtitle">Active, Renewed vs Expired policies</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.chartData.renewalData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Bar dataKey="active" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Active" />
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
                {stats.chartData.recentCustomers.map((c) => (
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
