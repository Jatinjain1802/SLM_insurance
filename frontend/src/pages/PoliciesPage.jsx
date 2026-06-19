import { useState, useEffect } from 'react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Pagination from '../components/Pagination'
import StatCard from '../components/StatCard'
import HighlightText from '../components/HighlightText'
import ViewPolicyModal from '../components/ViewPolicyModal'
import { policiesAPI, customersAPI, companiesAPI } from '../services/api'
import { FiEdit2, FiEye, FiPlus, FiFilter, FiClipboard } from 'react-icons/fi'

// Mock policies removed in favor of API

const EMPTY_FORM = {
  policyNumber: '', customerId: '', companyId: '', policyType: '',
  startDate: '', expiryDate: '', premiumAmount: '', paymentFrequency: 'yearly', status: 'active'
}

const POLICY_TYPES = ['Life', 'Health', 'Vehicle', 'Travel', 'Home', 'Term']
const FREQUENCIES = ['monthly', 'quarterly', 'half-yearly', 'yearly']

function PoliciesPage() {
  const [policies, setPolicies] = useState([])
  const [customers, setCustomers] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editPolicy, setEditPolicy] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  
  // View Details State
  const [viewPolicy, setViewPolicy] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  
  const [activeTypeFilter, setActiveTypeFilter] = useState('all')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [polRes, custRes, compRes] = await Promise.all([
          policiesAPI.getAll({ page, limit: 10 }),
          customersAPI.getAll({ limit: 100 }), // We might need all customers for the dropdown, passing high limit for now
          companiesAPI.getAll(),
        ])
        setPolicies(polRes.data.data)
        setTotalPages(polRes.data.totalPages)
        // Check if customers data is paginated or not
        setCustomers(custRes.data.data || custRes.data)
        setCompanies(compRes.data)
      } catch (err) {
        console.error('Failed to fetch data for policies page', err)
      }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [page])

  // Filter policies based on active tab and type filter
  const filteredByType = activeTypeFilter === 'all' 
    ? policies 
    : policies.filter(p => p.policyType === activeTypeFilter)

  const filtered = activeTab === 'all'
    ? filteredByType
    : filteredByType.filter(p => p.status === activeTab)

  const TABS = [
    { key: 'all',     label: `All (${filteredByType.length})` },
    { key: 'active',  label: `Active (${filteredByType.filter(p => p.status === 'active').length})` },
    { key: 'renewed', label: `Renewed (${filteredByType.filter(p => p.status === 'renewed').length})` },
    { key: 'expired', label: `Expired (${filteredByType.filter(p => p.status === 'expired').length})` },
    { key: 'pending', label: `Pending (${filteredByType.filter(p => p.status === 'pending').length})` },
  ]
  
  const TYPE_OPTIONS = [
    { label: 'All Types', value: 'all' },
    ...POLICY_TYPES.map(t => ({ label: t, value: t }))
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

  const openViewModal = async (id) => {
    try {
      const res = await policiesAPI.getById(id)
      setViewPolicy(res.data)
      setViewModalOpen(true)
    } catch (err) {
      alert('Failed to load policy details.')
    }
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
        const newPolicy = res.data
        newPolicy.customer = customers.find(c => c.id == form.customerId) || { name: 'Unknown' }
        newPolicy.company = companies.find(c => c.id == form.companyId) || { name: 'Unknown' }
        setPolicies([newPolicy, ...policies])
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
  const formatCurrency = (n) => (n !== null && n !== undefined && n !== '') ? '₹' + Number(n).toLocaleString('en-IN') : '—'

  const columns = [
    { key: 'policyNumber', label: 'Policy No.',
      render: (v, r, s) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-accent)' }}><HighlightText text={v} highlight={s} /></span>
    },
    { key: 'customer', label: 'Customer', render: (_, r, s) => <HighlightText text={r.customer?.name || '—'} highlight={s} /> },
    { key: 'company',  label: 'Company',  render: (_, r, s) => <HighlightText text={r.company?.name || '—'} highlight={s} /> },
    { key: 'policyType', label: 'Type',
      render: (v, r, s) => <span style={{ fontSize: 12, fontWeight: 500 }}><HighlightText text={v} highlight={s} /></span>
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="btn btn-outline btn-sm" 
            onClick={(e) => { e.stopPropagation(); openViewModal(row.id) }}
            title="View Details"
            style={{ padding: '4px 8px' }}
          >
            <FiEye size={16} />
          </button>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={(e) => { e.stopPropagation(); openEditModal(row) }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}
          >
            <FiEdit2 size={14} /> Edit
          </button>
        </div>
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
        emptyIcon={<FiClipboard />}
        filterOptions={TYPE_OPTIONS}
        activeFilter={activeTypeFilter}
        onFilterChange={setActiveTypeFilter}
      />

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
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
                <select name="paymentFrequency" className="form-control" value={form.paymentFrequency} onChange={handleChange}>
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
      <ViewPolicyModal 
        isOpen={viewModalOpen} 
        onClose={() => setViewModalOpen(false)} 
        viewPolicy={viewPolicy} 
      />
    </div>
  )
}

export default PoliciesPage
