// pages/PremiumsPage.jsx
// LEARNING NOTE:
// Tabs split data into: Upcoming / Overdue / Paid
// "Mark as Paid" is a PUT /api/premiums/:id/pay call.
// We optimistically update UI before the API responds for snappy UX.

import { useState, useEffect } from 'react'
import DataTable from '../components/DataTable'
import Badge from '../components/Badge'
import HighlightText from '../components/HighlightText'
import { premiumsAPI } from '../services/api'
import { FiAlertTriangle, FiCheckCircle, FiDollarSign } from 'react-icons/fi'

// Mock premiums removed

function PremiumsPage() {
  const [premiums, setPremiums] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [paying, setPaying] = useState(null)

  useEffect(() => {
    const fetchPremiums = async () => {
      setLoading(true)
      try {
        const res = await premiumsAPI.getAll()
        setPremiums(res.data)
      } catch (err) {
        console.error('Failed to fetch premiums', err)
      }
      finally { setLoading(false) }
    }
    fetchPremiums()
  }, [])

  const filtered = premiums.filter(p => p.status === activeTab)

  const handleMarkPaid = async (premium) => {
    setPaying(premium.id)
    try {
      await premiumsAPI.markPaid(premium.id)
      setPremiums(premiums.map(p =>
        p.id === premium.id ? { ...p, status: 'paid' } : p
      ))
    } catch (err) {
      console.error('Failed to mark premium as paid', err)
      alert(err.response?.data?.message || 'Failed to update status.')
    }
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
      render: (_, r, s) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-accent)' }}><HighlightText text={r.policy?.policyNumber || '—'} highlight={s} /></span>
    },
    { key: 'customer', label: 'Customer', render: (_, r, s) => <HighlightText text={r.policy?.customer?.name || '—'} highlight={s} /> },
    { key: 'amount',   label: 'Premium',
      render: (v, r, s) => <span style={{ fontWeight: 700, fontSize: 15 }}><HighlightText text={formatCurrency(v)} highlight={s} /></span>
    },
    { key: 'dueDate',  label: 'Due Date',
      render: (v, row) => (
        <div>
          <div>{formatDate(v)}</div>
          {row.status === 'upcoming' && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Upcoming
            </div>
          )}
          {row.status === 'overdue' && (
            <div style={{ fontSize: 11, color: 'var(--danger)' }}>
              Overdue
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiAlertTriangle /> <strong>{premiums.filter(p => p.status === 'overdue').length} overdue premiums</strong> need immediate attention.
          </div>
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
        emptyIcon={activeTab === 'paid' ? <FiCheckCircle /> : <FiDollarSign />}
      />
    </div>
  )
}

export default PremiumsPage
