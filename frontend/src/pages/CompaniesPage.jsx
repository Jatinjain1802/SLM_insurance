// pages/CompaniesPage.jsx
// Insurance company management — simple CRUD with a grid card layout

import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import { companiesAPI } from '../services/api'

const MOCK_COMPANIES = [
  { id: 1, name: 'LIC',           code: 'LIC001', type: 'Life',    contact: '1800-33-0000', policies: 45 },
  { id: 2, name: 'HDFC Life',     code: 'HDR002', type: 'Life',    contact: '1800-267-9999', policies: 32 },
  { id: 3, name: 'ICICI Lombard', code: 'ICI003', type: 'General', contact: '1800-2666',    policies: 28 },
  { id: 4, name: 'Bajaj Allianz', code: 'BAJ004', type: 'General', contact: '1800-209-5858', policies: 19 },
  { id: 5, name: 'SBI Life',      code: 'SBI005', type: 'Life',    contact: '1800-267-9090', policies: 24 },
  { id: 6, name: 'Star Health',   code: 'STR006', type: 'Health',  contact: '1800-425-2255', policies: 15 },
]

const COMPANY_TYPES = ['Life', 'General', 'Health', 'Travel']
const TYPE_COLORS = { Life: '#3b82f6', General: '#f59e0b', Health: '#22c55e', Travel: '#8b5cf6' }

const EMPTY_FORM = { name: '', code: '', type: '', contact: '' }

function CompaniesPage() {
  const [companies, setCompanies] = useState(MOCK_COMPANIES)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCompany, setEditCompany] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const openAddModal = () => { setEditCompany(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEditModal = (c) => { setEditCompany(c); setForm({ name: c.name, code: c.code, type: c.type, contact: c.contact }); setModalOpen(true) }
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

  return (
    <div className="page-container page-fade-in">
      <div className="page-header">
        <div>
          <h1>Insurance Companies</h1>
          <p className="page-subtitle">{companies.length} companies registered</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-bar">
            <span className="search-bar-icon">🔍</span>
            <input className="search-input" placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>+ Add Company</button>
        </div>
      </div>

      {/* Company Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filtered.map(company => (
          <div key={company.id} className="card" style={{ borderTop: `3px solid ${TYPE_COLORS[company.type] || '#3b82f6'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '10px',
                background: `${TYPE_COLORS[company.type] || '#3b82f6'}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>
                🏢
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn-icon" onClick={() => openEditModal(company)} title="Edit">✏️</button>
                <button className="btn-icon" onClick={() => handleDelete(company)} title="Delete">🗑️</button>
              </div>
            </div>

            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{company.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Code: {company.code}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Type</span>
                <span style={{
                  color: TYPE_COLORS[company.type] || '#3b82f6',
                  fontWeight: 600, fontSize: 12,
                  background: `${TYPE_COLORS[company.type] || '#3b82f6'}15`,
                  padding: '2px 8px', borderRadius: '9999px'
                }}>{company.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Contact</span>
                <span style={{ fontWeight: 500 }}>{company.contact}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Policies</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{company.policies}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-state-icon">🏢</div>
          <h3>No companies found</h3>
          <p>Add your first insurance company to get started.</p>
        </div>
      )}

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
              <input name="contact" className="form-control" value={form.contact} onChange={handleChange} placeholder="1800-XXXXXX" />
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
    </div>
  )
}

export default CompaniesPage
