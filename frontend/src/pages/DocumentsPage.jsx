// pages/DocumentsPage.jsx
// LEARNING NOTE:
// File uploads use the FormData API — a special object that can hold files.
// We set Content-Type to multipart/form-data so the server knows it's a file.
// The `input type="file"` element gives us access to the selected file via e.target.files[0].

import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import { documentsAPI, customersAPI } from '../services/api'

const MOCK_DOCS = [
  { id: 1, customerName: 'Rahul Sharma',    docType: 'Policy PDF',      fileName: 'LIC-2024-001.pdf',    uploadedAt: '2024-01-15', size: '2.4 MB' },
  { id: 2, customerName: 'Rahul Sharma',    docType: 'Aadhaar',         fileName: 'aadhaar_rahul.pdf',   uploadedAt: '2024-01-15', size: '0.8 MB' },
  { id: 3, customerName: 'Priya Patel',     docType: 'PAN',             fileName: 'pan_priya.pdf',       uploadedAt: '2025-07-01', size: '0.5 MB' },
  { id: 4, customerName: 'Amit Verma',      docType: 'Premium Receipt', fileName: 'receipt_BAJ_2023.pdf', uploadedAt: '2023-09-10', size: '0.3 MB' },
  { id: 5, customerName: 'Sunita Joshi',    docType: 'Policy PDF',      fileName: 'SBI-2025-207.pdf',    uploadedAt: '2025-01-15', size: '3.1 MB' },
]

const DOC_TYPES = ['Policy PDF', 'Aadhaar', 'PAN', 'Premium Receipt', 'Proposal Form', 'Other']
const DOC_ICONS = { 'Policy PDF': '📄', 'Aadhaar': '🪪', 'PAN': '💳', 'Premium Receipt': '🧾', 'Proposal Form': '📝', 'Other': '📁' }

function DocumentsPage() {
  const [docs, setDocs] = useState(MOCK_DOCS)
  const [customers, setCustomers] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [form, setForm] = useState({ customerId: '', docType: '', policyId: '' })

  useEffect(() => {
    customersAPI.getAll().then(r => setCustomers(r.data)).catch(() => {})
  }, [])

  const filtered = docs.filter(d =>
    d.customerName.toLowerCase().includes(search.toLowerCase()) ||
    d.docType.toLowerCase().includes(search.toLowerCase()) ||
    d.fileName.toLowerCase().includes(search.toLowerCase())
  )

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) return
    setUploading(true)

    try {
      // FormData is used to send files along with other fields
      const formData = new FormData()
      formData.append('file', selectedFile)         // The actual file
      formData.append('customerId', form.customerId)
      formData.append('docType', form.docType)

      await documentsAPI.upload(formData)
      // Add to local list as mock
      setDocs([{
        id: Date.now(),
        customerName: customers.find(c => c.id === form.customerId)?.name || 'Customer',
        docType: form.docType,
        fileName: selectedFile.name,
        uploadedAt: new Date().toISOString().split('T')[0],
        size: (selectedFile.size / (1024*1024)).toFixed(1) + ' MB'
      }, ...docs])
      setModalOpen(false)
      setSelectedFile(null)
      setForm({ customerId: '', docType: '', policyId: '' })
    } catch {
      // Mock add anyway
      setDocs([{
        id: Date.now(),
        customerName: 'New Customer',
        docType: form.docType || 'Other',
        fileName: selectedFile.name,
        uploadedAt: new Date().toISOString().split('T')[0],
        size: (selectedFile.size / (1024*1024)).toFixed(1) + ' MB'
      }, ...docs])
      setModalOpen(false)
      setSelectedFile(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (doc) => {
    if (!window.confirm(`Delete ${doc.fileName}?`)) return
    setDocs(docs.filter(d => d.id !== doc.id))
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="page-container page-fade-in">
      <div className="page-header">
        <div>
          <h1>Documents</h1>
          <p className="page-subtitle">{docs.length} documents stored</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-bar">
            <span className="search-bar-icon">🔍</span>
            <input className="search-input" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>↑ Upload Document</button>
        </div>
      </div>

      {/* Document Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {filtered.map(doc => (
          <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '10px',
                background: 'rgba(59,130,246,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22
              }}>
                {DOC_ICONS[doc.docType] || '📁'}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn-icon" title="Download" onClick={() => alert('Download: ' + doc.fileName)}>⬇️</button>
                <button className="btn-icon" title="Delete" onClick={() => handleDelete(doc)}>🗑️</button>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, wordBreak: 'break-all' }}>{doc.fileName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doc.size}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--bg-border)', paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Customer</span>
                <span style={{ fontWeight: 500 }}>{doc.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Type</span>
                <span style={{
                  background: 'rgba(59,130,246,0.1)', color: 'var(--primary-400)',
                  padding: '1px 8px', borderRadius: '9999px', fontWeight: 500
                }}>{doc.docType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Uploaded</span>
                <span>{formatDate(doc.uploadedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-state-icon">📁</div>
          <h3>No documents found</h3>
          <p>Upload policy PDFs, Aadhaar, PAN, and other customer documents.</p>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Document">
        <form onSubmit={handleUpload}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Customer</label>
              <select name="customerId" className="form-control" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}>
                <option value="">Select customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Document Type <span className="form-required">*</span></label>
              <select name="docType" className="form-control" value={form.docType} onChange={e => setForm({ ...form, docType: e.target.value })} required>
                <option value="">Select type...</option>
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Choose File <span className="form-required">*</span></label>
              <input
                type="file"
                className="form-control"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                required
                style={{ padding: '8px' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Accepted: PDF, JPG, PNG</div>
              {selectedFile && (
                <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 6 }}>
                  ✓ {selectedFile.name} ({(selectedFile.size / (1024*1024)).toFixed(1)} MB)
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading...' : '↑ Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DocumentsPage
