// pages/CompaniesPage.jsx
// Insurance company management — simple CRUD with a grid card layout

import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import HighlightText from '../components/HighlightText'
import DataTable from '../components/DataTable'
import CompanyBulkUploadModal from '../components/CompanyBulkUploadModal'
import { companiesAPI } from '../services/api'
import { FiEdit2, FiTrash2, FiBriefcase, FiUploadCloud } from 'react-icons/fi'

const COMPANY_TYPES = ['Life', 'General', 'Health', 'Travel']
const TYPE_COLORS = { Life: '#3b82f6', General: '#f59e0b', Health: '#22c55e', Travel: '#8b5cf6' }

const EMPTY_FORM = { name: '', code: '', type: '', contactDetails: '' }

function CompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    companiesAPI.getAll()
      .then(res => setCompanies(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])
  const [modalOpen, setModalOpen] = useState(false)
  const [editCompany, setEditCompany] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)

  const handleBulkUploadComplete = async (companiesData) => {
    try {
      const res = await companiesAPI.bulkCreate(companiesData)
      let msg = `Upload complete!\nSuccess: ${res.data.successCount}\nSkipped: ${res.data.skipCount}`
      if (res.data.errors && res.data.errors.length > 0) {
        msg += `\n\nErrors:\n${res.data.errors.slice(0, 5).join('\n')}`
        if (res.data.errors.length > 5) msg += `\n...and ${res.data.errors.length - 5} more.`
      }
      alert(msg)
      
      const fetchRes = await companiesAPI.getAll()
      setCompanies(fetchRes.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to bulk upload companies.')
      throw err
    }
  }


  const openAddModal = () => { setEditCompany(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEditModal = (c) => { setEditCompany(c); setForm({ name: c.name, code: c.code, type: c.type, contactDetails: c.contactDetails || '' }); setModalOpen(true) }
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editCompany) {
        await companiesAPI.update(editCompany.id, form)
        setCompanies(companies.map(c => c.id === editCompany.id ? { ...c, ...form } : c))
      } else {
        const res = await companiesAPI.create(form)
        setCompanies([res.data, ...companies])
      }
      setModalOpen(false)
    } catch {
      if (editCompany) {
        setCompanies(companies.map(c => c.id === editCompany.id ? { ...c, ...form } : c))
      } else {
        setCompanies([{ id: Date.now(), ...form, policies: 0 }, ...companies])
      }
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (company) => {
    if (!window.confirm(`Delete ${company.name}?`)) return
    try { await companiesAPI.delete(company.id) } catch {}
    setCompanies(companies.filter(c => c.id !== company.id))
  }

  const columns = [
    { 
      key: 'name', 
      label: 'Company Name',
      render: (v, r, s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '8px',
            background: `${TYPE_COLORS[r.type] || '#3b82f6'}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0
          }}>🏢</div>
          <div style={{ fontWeight: 600 }}><HighlightText text={v} highlight={s} /></div>
        </div>
      )
    },
    { key: 'code', label: 'Code', render: (v, r, s) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-accent)' }}><HighlightText text={v} highlight={s} /></span> },
    { 
      key: 'type', 
      label: 'Type',
      render: (v, r, s) => (
        <span style={{
          color: TYPE_COLORS[v] || '#3b82f6',
          fontWeight: 600, fontSize: 12,
          background: `${TYPE_COLORS[v] || '#3b82f6'}15`,
          padding: '4px 10px', borderRadius: '9999px'
        }}>
          <HighlightText text={v} highlight={s} />
        </span>
      )
    },
    { key: 'contactDetails', label: 'Contact', render: (v, r, s) => <span style={{ fontWeight: 500 }}><HighlightText text={v || '—'} highlight={s} /></span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => { e.stopPropagation(); openEditModal(row) }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <FiEdit2 /> Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={(e) => { e.stopPropagation(); handleDelete(row) }}
          >
            <FiTrash2 />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="page-container page-fade-in">
      <div className="page-header">
        <div>
          <h1>Insurance Companies</h1>
          <p className="page-subtitle">{companies.length} companies registered</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setBulkModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiUploadCloud /> Bulk Upload CSV
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>+ Add Company</button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={companies}
        loading={loading}
        searchPlaceholder="Search companies by name or code..."
        emptyMessage="No companies found"
        emptyIcon="🏢"
      />

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCompany ? 'Edit Company' : 'Add Insurance Company'}>
        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Company Name <span className="form-required">*</span></label>
              <input name="name" className="form-control" value={form.name} onChange={handleChange} placeholder="LIC" required />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Company Code <span className="form-required">*</span></label>
                <input name="code" className="form-control" value={form.code} onChange={handleChange} placeholder="LIC001" required style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Type <span className="form-required">*</span></label>
                <select name="type" className="form-control" value={form.type} onChange={handleChange} required>
                  <option value="">Select type...</option>
                  {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input name="contactDetails" className="form-control" value={form.contactDetails} onChange={handleChange} placeholder="1800-XXXXXX" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editCompany ? '✓ Update' : '+ Add Company'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ---- Bulk Upload Modal ---- */}
      <CompanyBulkUploadModal 
        isOpen={bulkModalOpen} 
        onClose={() => setBulkModalOpen(false)} 
        onUploadComplete={handleBulkUploadComplete} 
      />
    </div>
  )
}

export default CompaniesPage
