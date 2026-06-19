// pages/CustomerDetailPage.jsx
// LEARNING NOTE:
// useParams() gets URL parameters. For /customers/5, it gives us { id: '5' }.
// We use the id to fetch that specific customer's data from the API.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Badge from '../components/Badge'
import { customersAPI, policiesAPI } from '../services/api'
import { FiEye, FiDownload } from 'react-icons/fi'
import DataTable from '../components/DataTable'
import HighlightText from '../components/HighlightText'
import ViewPolicyModal from '../components/ViewPolicyModal'
import { documentsAPI } from '../services/api'
import { FiXCircle, FiSmartphone, FiMail, FiPlus, FiArrowLeft } from 'react-icons/fi'

function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [policies, setPolicies] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewPolicy, setViewPolicy] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [custRes, polRes, docRes] = await Promise.all([
          customersAPI.getById(id),
          policiesAPI.getByCustomer(id),
          documentsAPI.getByCustomer(id),
        ])
        setCustomer(custRes.data)
        setPolicies(polRes.data)
        setDocuments(docRes.data)
      } catch (err) {
        console.error('Error fetching customer details:', err)
      }
      finally { setLoading(false) }
    }
    fetchData()
  }, [id])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const formatCurrency = (n) => n ? '₹' + Number(n).toLocaleString('en-IN') : '—'

  const openViewModal = async (id) => {
    try {
      const res = await policiesAPI.getById(id)
      setViewPolicy(res.data)
      setViewModalOpen(true)
    } catch (err) {
      alert('Failed to load policy details.')
    }
  }

  const handleSecureAction = async (doc, action) => {
    try {
      const res = await documentsAPI.download(doc.id)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] }))
      
      if (action === 'view') {
        window.open(url, '_blank')
      } else {
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', doc.fileName)
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
      
      // Clean up the object URL after a short delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch (err) {
      console.error('Document error:', err)
      alert(`Failed to ${action} the document securely.`)
    }
  }

  const columns = [
    { key: 'policyNumber', label: 'Policy No.',
      render: (v, r, s) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-accent)' }}><HighlightText text={v} highlight={s} /></span>
    },
    { key: 'policyType', label: 'Type',
      render: (v, r, s) => <span style={{ fontSize: 12, fontWeight: 500 }}><HighlightText text={v} highlight={s} /></span>
    },
    { key: 'company', label: 'Company', render: (_, r, s) => <HighlightText text={r.company?.name || '—'} highlight={s} /> },
    { key: 'premiumAmount', label: 'Premium',
      render: (v) => <span style={{ fontWeight: 600 }}>{formatCurrency(v)}</span>
    },
    { key: 'expiryDate', label: 'Expiry Date',
      render: (v) => formatDate(v)
    },
    { key: 'status', label: 'Status',
      render: (v) => <Badge status={v} />
    },
    { key: 'actions', label: '',
      render: (_, row) => (
        <button 
          className="btn btn-outline btn-sm" 
          onClick={(e) => { e.stopPropagation(); openViewModal(row.id) }}
          title="View Details"
          style={{ padding: '4px 8px' }}
        >
          <FiEye size={16} />
        </button>
      )
    }
  ]

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p>Loading customer details...</p>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="page-container page-fade-in">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers')} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FiArrowLeft /> Back to Customers
        </button>
        <div className="empty-state">
          <div className="empty-state-icon"><FiXCircle /></div>
          <h3>Customer Not Found</h3>
          <p>The customer you are looking for does not exist or has been deleted.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container page-fade-in">
      {/* Back button */}
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers')} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <FiArrowLeft /> Back to Customers
      </button>

      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: 'white',
          }}>
            {customer.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1>{customer.name}</h1>
            <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiSmartphone /> {customer.mobile} <span style={{opacity: 0.5}}>·</span> <FiMail /> {customer.email}
            </p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/policies')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiPlus /> Add Policy</button>
      </div>

      {/* Info Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Personal Details */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Personal Details</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Date of Birth', value: formatDate(customer.dob) },
              { label: 'Address',       value: customer.address },
              { label: 'Aadhaar',       value: customer.aadhaar ? '•••• •••• ' + customer.aadhaar?.slice(-4) : '—' },
              { label: 'PAN',           value: customer.pan },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bg-border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Policy Summary</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Total Policies',  value: policies.length },
              { label: 'Active',          value: policies.filter(p => p.status === 'active').length },
              { label: 'Expired',         value: policies.filter(p => p.status === 'expired').length },
              { label: 'Total Premium',   value: formatCurrency(policies.reduce((s, p) => s + Number(p.premiumAmount || 0), 0)) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bg-border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Policies Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">Policies</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/policies')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiPlus /> New Policy</button>
        </div>
        <DataTable
          columns={columns}
          data={policies}
          loading={loading}
          searchPlaceholder="Search policies..."
          emptyMessage="No policies found"
        />
      </div>

      {/* Documents Section */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Documents</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/documents')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiPlus /> Upload Document</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: 500, wordBreak: 'break-all' }}>{doc.fileName}</td>
                  <td><span style={{
                    background: 'rgba(59,130,246,0.1)', color: 'var(--primary-400)',
                    padding: '2px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500
                  }}>{doc.docType}</span></td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{(doc.fileSize / (1024*1024)).toFixed(2)} MB</td>
                  <td>{formatDate(doc.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => handleSecureAction(doc, 'view')}
                        title="Secure View"
                        style={{ padding: '4px 8px' }}
                      >
                        <FiEye size={16} />
                      </button>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => handleSecureAction(doc, 'download')}
                        title="Secure Download"
                        style={{ padding: '4px 8px' }}
                      >
                        <FiDownload size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No documents found for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ViewPolicyModal 
        isOpen={viewModalOpen} 
        onClose={() => setViewModalOpen(false)} 
        viewPolicy={viewPolicy} 
      />
    </div>
  )
}

export default CustomerDetailPage
