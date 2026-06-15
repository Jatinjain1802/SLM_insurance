// pages/PoliciesPage.jsx
// LEARNING NOTE:
// We use a "tab" system (All / Active / Expired / Pending) to filter policies.
// Filtering is done on the frontend — we don't need a separate API call for each tab.
// We just filter the same `policies` array with .filter()

import { useState, useEffect } from 'react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { policiesAPI, customersAPI, companiesAPI } from '../services/api'

// Mock policies removed in favor of API

const EMPTY_FORM = {
  policyNumber: '', customerId: '', companyId: '', type: '',
  startDate: '', expiryDate: '', premiumAmount: '', frequency: 'yearly', status: 'active'
}

const POLICY_TYPES = ['Life', 'Health', 'Vehicle', 'Travel', 'Home', 'Term']
const FREQUENCIES = ['monthly', 'quarterly', 'half-yearly', 'yearly']

function PoliciesPage() {
  const [policies, setPolicies] = useState([])
  const [customers, setCustomers] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editPolicy, setEditPolicy] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [polRes, custRes, compRes] = await Promise.all([
          policiesAPI.getAll(),
          customersAPI.getAll(),
          companiesAPI.getAll(),
        ])
        setPolicies(polRes.data)
        setCustomers(custRes.data)
        setCompanies(compRes.data)
      } catch (err) {
        console.error('Failed to fetch data for policies page', err)
      }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  // Filter policies based on active tab
  const filtered = activeTab === 'all'
    ? policies
    : policies.filter(p => p.status === activeTab)

  const TABS = [
    { key: 'all',     label: `All (${policies.length})` },
    { key: 'active',  label: `Active (${policies.filter(p => p.status === 'active').length})` },
    { key: 'expired', label: `Expired (${policies.filter(p => p.status === 'expired').length})` },
    { key: 'pending', label: `Pending (${policies.filter(p => p.status === 'pending').length})` },
  ]

  const openAddModal = () => {
    setEditPolicy(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEditModal = (policy) => {
    setEditPolicy(policy)
    setForm({ ...policy })
    setModalOpen(true)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editPolicy) {
        await policiesAPI.update(editPolicy.id, form)
        setPolicies(policies.map(p => p.id === editPolicy.id ? { ...p, ...form } : p))
      } else {
        const res = await policiesAPI.create(form)
        setPolicies([res.data, ...policies])
      }
      setModalOpen(false)
    } catch (err) {
      console.error('Save failed', err)
      alert(err.response?.data?.message || 'Failed to save policy.')
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const formatCurrency = (n) => n ? '₹' + Number(n).toLocaleString('en-IN') : '—'

  const columns = [
    { key: 'policyNumber', label: 'Policy No.',
      render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-accent)' }}>{v}</span>
    },
    { key: 'customer', label: 'Customer', render: (_, r) => r.customer?.name || '—' },
    { key: 'company',  label: 'Company',  render: (_, r) => r.company?.name || '—' },
    { key: 'policyType', label: 'Type',
      render: (v) => <span style={{ fontSize: 12, fontWeight: 500 }}>{v}</span>
    },
    { key: 'premiumAmount', label: 'Premium',
      render: (v) => <span style={{ fontWeight: 600 }}>{formatCurrency(v)}</span>
    },
    { key: 'expiryDate', label: 'Expiry',
      render: (v) => {
        const days = Math.ceil((new Date(v) - new Date()) / (1000*60*60*24))
        const expiringSoon = days > 0 && days <= 30
        return (
          <span style={{ color: expiringSoon ? 'var(--warning)' : 'inherit' }}>
            {formatDate(v)} {expiringSoon && `(${days}d)`}
          </span>
        )
      }
    },
    { key: 'status', label: 'Status',
      render: (v) => <Badge status={v} />
    },
    { key: 'actions', label: '',
      render: (_, row) => (
        <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); openEditModal(row) }}>
          ✏️ Edit
        </button>
      )
    }
  ]

  return (
    <div className="page-container page-fade-in">
      <div className="page-header">
        <div>
          <h1>Policies</h1>
          <p className="page-subtitle">{policies.length} total policies</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add Policy</button>
      </div>

      {/* Status Tabs */}
      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchPlaceholder="Search policies..."
        emptyMessage="No policies found"
        emptyIcon="📋"
      />

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editPolicy ? 'Edit Policy' : 'Add New Policy'} size="lg">
        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Policy Number <span className="form-required">*</span></label>
                <input name="policyNumber" className="form-control" value={form.policyNumber} onChange={handleChange} placeholder="LIC-2026-001" required style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Customer <span className="form-required">*</span></label>
                <select name="customerId" className="form-control" value={form.customerId} onChange={handleChange} required>
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Insurance Company <span className="form-required">*</span></label>
                <select name="companyId" className="form-control" value={form.companyId} onChange={handleChange} required>
                  <option value="">Select company...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Policy Type <span className="form-required">*</span></label>
                <select name="policyType" className="form-control" value={form.policyType || form.type} onChange={(e) => setForm({...form, policyType: e.target.value, type: e.target.value})} required>
                  <option value="">Select type...</option>
                  {POLICY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Premium Amount (₹) <span className="form-required">*</span></label>
                <input name="premiumAmount" type="number" className="form-control" value={form.premiumAmount} onChange={handleChange} placeholder="5000" required />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Frequency</label>
                <select name="frequency" className="form-control" value={form.frequency} onChange={handleChange}>
                  {FREQUENCIES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input name="startDate" type="date" className="form-control" value={form.startDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Expiry Date <span className="form-required">*</span></label>
                <input name="expiryDate" type="date" className="form-control" value={form.expiryDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                  {['active','expired','renewed','pending'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editPolicy ? '✓ Update Policy' : '+ Add Policy'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PoliciesPage
