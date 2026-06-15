// pages/ReportsPage.jsx
// Charts for: Revenue, Policy distribution, Customer growth, Company-wise sales

import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 142000, target: 150000 },
  { month: 'Feb', revenue: 158000, target: 155000 },
  { month: 'Mar', revenue: 134000, target: 160000 },
  { month: 'Apr', revenue: 172000, target: 165000 },
  { month: 'May', revenue: 165000, target: 170000 },
  { month: 'Jun', revenue: 184500, target: 175000 },
]

const CUSTOMER_GROWTH = [
  { month: 'Jan', new: 18, total: 180 },
  { month: 'Feb', new: 24, total: 204 },
  { month: 'Mar', new: 15, total: 219 },
  { month: 'Apr', new: 28, total: 247 },
  { month: 'May', new: 22, total: 269 },
  { month: 'Jun', new: 19, total: 288 },
]

const COMPANY_SALES = [
  { company: 'LIC',    policies: 45, revenue: 225000 },
  { company: 'HDFC',   policies: 32, revenue: 192000 },
  { company: 'ICICI',  policies: 28, revenue: 168000 },
  { company: 'Bajaj',  policies: 19, revenue: 114000 },
  { company: 'SBI',    policies: 24, revenue: 144000 },
  { company: 'Star',   policies: 15, revenue: 90000 },
]

const POLICY_PIE = [
  { name: 'Life',    value: 42, color: '#3b82f6' },
  { name: 'Health',  value: 28, color: '#22c55e' },
  { name: 'Vehicle', value: 20, color: '#f59e0b' },
  { name: 'Travel',  value: 10, color: '#8b5cf6' },
]

const SUMMARY_STATS = [
  { label: 'Total Revenue (YTD)',  value: '₹9,55,500', change: '+18%' },
  { label: 'New Customers (YTD)', value: '126',        change: '+22%' },
  { label: 'Policies Sold (YTD)', value: '163',        change: '+15%' },
  { label: 'Renewal Rate',        value: '87%',        change: '+4%' },
]

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--bg-border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: 13,
  }
}

function ReportsPage() {
  const [period, setPeriod] = useState('6m')

  return (
    <div className="page-container page-fade-in">
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="page-subtitle">Business performance overview</p>
        </div>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {['6m', '1y', 'all'].map(p => (
            <button key={p} className={`tab-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p === '6m' ? 'Last 6 Months' : p === '1y' ? 'Last Year' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {SUMMARY_STATS.map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>{stat.change} vs last period</div>
          </div>
        ))}
      </div>

      {/* Revenue vs Target */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Revenue vs Target</div>
            <div className="card-subtitle">Monthly premium collection compared to targets</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={MONTHLY_REVENUE}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={v => [`₹${v.toLocaleString('en-IN')}`, '']} />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" name="Revenue" />
            <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="charts-grid">
        {/* Customer Growth */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Customer Growth</div>
              <div className="card-subtitle">New vs Total customers</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CUSTOMER_GROWTH}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="new" fill="#22c55e" radius={[4,4,0,0]} name="New Customers" barSize={18} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Policy Type Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Policy Distribution</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={POLICY_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value">
                {POLICY_PIE.map(entry => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Share']} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Company-wise Sales Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Company-wise Performance</div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Company</th>
                <th>Policies Sold</th>
                <th>Revenue Generated</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {COMPANY_SALES.sort((a, b) => b.revenue - a.revenue).map((c, idx) => {
                const totalRev = COMPANY_SALES.reduce((s, x) => s + x.revenue, 0)
                const share = ((c.revenue / totalRev) * 100).toFixed(1)
                return (
                  <tr key={c.company}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{c.company}</td>
                    <td>{c.policies}</td>
                    <td style={{ fontWeight: 600 }}>₹{c.revenue.toLocaleString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          height: 6, width: `${share * 2}px`, maxWidth: 100,
                          background: 'var(--primary-600)', borderRadius: '9999px',
                          minWidth: 20
                        }} />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{share}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
