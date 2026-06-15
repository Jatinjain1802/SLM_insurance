// pages/PremiumsPage.jsx
// LEARNING NOTE:
// Tabs split data into: Upcoming / Overdue / Paid
// "Mark as Paid" is a PUT /api/premiums/:id/pay call.
// We optimistically update UI before the API responds for snappy UX.

import { useState, useEffect } from 'react'
import DataTable from '../components/DataTable'
import Badge from '../components/Badge'
import { premiumsAPI } from '../services/api'

const MOCK_PREMIUMS = [
  { id: 1, policyNumber: 'LIC-2024-001', customer: 'Rahul Sharma',    amount: 5000, dueDate: '2026-06-25', status: 'upcoming', daysLeft: 10 },
  { id: 2, policyNumber: 'HDR-2025-042', customer: 'Priya Patel',     amount: 3500, dueDate: '2026-06-30', status: 'upcoming', daysLeft: 15 },
  { id: 3, policyNumber: 'SBI-2025-207', customer: 'Sunita Joshi',    amount: 6000, dueDate: '2026-06-10', status: 'overdue',  daysLeft: -5 },
  { id: 4, policyNumber: 'BAJ-2023-118', customer: 'Amit Verma',      amount: 2200, dueDate: '2026-05-31', status: 'overdue',  daysLeft: -15 },
  { id: 5, policyNumber: 'LIC-2022-089', customer: 'Neha Singh',      amount: 3000, dueDate: '2026-05-15', status: 'paid',     daysLeft: 0 },
  { id: 6, policyNumber: 'HDR-2024-156', customer: 'Vijay Kumar',     amount: 1500, dueDate: '2026-04-30', status: 'paid',     daysLeft: 0 },
  { id: 7, policyNumber: 'ICI-2025-334', customer: 'Deepak Malhotra', amount: 4000, dueDate: '2026-07-15', status: 'upcoming', daysLeft: 30 },
]

function PremiumsPage() {
  const [premiums, setPremiums] = useState(MOCK_PREMIUMS)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [paying, setPaying] = useState(null)

  useEffect(() => {
    const fetchPremiums = async () => {
      setLoading(true)
      try {
        const [upcomingRes, overdueRes] = await Promise.all([
          premiumsAPI.getUpcoming(),
          premiumsAPI.getOverdue(),
        ])
        setPremiums([...upcomingRes.data, ...overdueRes.data])
      } catch { /* use mock data */ }
      finally { setLoading(false) }
    }
    fetchPremiums()
  }, [])

  const filtered = premiums.filter(p => p.status === activeTab)

  const handleMarkPaid = async (premium) => {
    setPaying(premium.id)
    try {
      await premiumsAPI.markPaid(premium.id)
    } catch { /* mock update */ }
    setPremiums(premiums.map(p =>
      p.id === premium.id ? { ...p, status: 'paid' } : p
    ))
    setPaying(null)
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const formatCurrency = (n) => '₹' + Number(n).toLocaleString('en-IN')

  const TABS = [
    { key: 'upcoming', label: `Upcoming (${premiums.filter(p => p.status === 'upcoming').length})`, color: 'var(--info)' },
    { key: 'overdue',  label: `Overdue (${premiums.filter(p => p.status === 'overdue').length})`,  color: 'var(--danger)' },
    { key: 'paid',     label: `Paid (${premiums.filter(p => p.status === 'paid').length})`,        color: 'var(--success)' },
  ]

  const columns = [
    { key: 'policyNumber', label: 'Policy No.',
      render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-accent)' }}>{v}</span>
    },
    { key: 'customer', label: 'Customer' },
    { key: 'amount',   label: 'Premium',
      render: (v) => <span style={{ fontWeight: 700, fontSize: 15 }}>{formatCurrency(v)}</span>
    },
    { key: 'dueDate',  label: 'Due Date',
      render: (v, row) => (
        <div>
          <div>{formatDate(v)}</div>
          {row.status === 'upcoming' && row.daysLeft > 0 && (
            <div style={{ fontSize: 11, color: row.daysLeft <= 7 ? 'var(--warning)' : 'var(--text-muted)' }}>
              {row.daysLeft} days left
            </div>
          )}
          {row.status === 'overdue' && (
            <div style={{ fontSize: 11, color: 'var(--danger)' }}>
              {Math.abs(row.daysLeft)} days overdue
            </div>
          )}
        </div>
      )
    },
    { key: 'status', label: 'Status',
      render: (v) => <Badge status={v} />
    },
    { key: 'actions', label: '',
      render: (_, row) => (
        row.status !== 'paid' ? (
          <button
            className="btn btn-success btn-sm"
            onClick={() => handleMarkPaid(row)}
            disabled={paying === row.id}
          >
            {paying === row.id ? '...' : '✓ Mark Paid'}
          </button>
        ) : (
          <span style={{ color: 'var(--success)', fontSize: 13 }}>✓ Paid</span>
        )
      )
    },
  ]

  return (
    <div className="page-container page-fade-in">
      <div className="page-header">
        <div>
          <h1>Premium Tracking</h1>
          <p className="page-subtitle">Monitor and manage all premium payments</p>
        </div>
      </div>

      {/* Alert for overdue */}
      {premiums.filter(p => p.status === 'overdue').length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          ⚠️ <strong>{premiums.filter(p => p.status === 'overdue').length} overdue premiums</strong> need immediate attention.
          Consider sending WhatsApp/SMS reminders from the Notifications page.
        </div>
      )}

      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            style={activeTab === tab.key ? { color: tab.color } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchPlaceholder="Search premiums..."
        emptyMessage={`No ${activeTab} premiums`}
        emptyIcon={activeTab === 'paid' ? '✅' : '💰'}
      />
    </div>
  )
}

export default PremiumsPage
