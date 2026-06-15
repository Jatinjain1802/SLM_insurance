// pages/CustomerDetailPage.jsx
// LEARNING NOTE:
// useParams() gets URL parameters. For /customers/5, it gives us { id: '5' }.
// We use the id to fetch that specific customer's data from the API.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Badge from '../components/Badge'
import { customersAPI, policiesAPI } from '../services/api'

const MOCK_CUSTOMER = {
  id: 1, name: 'Rahul Sharma', mobile: '9876543210', email: 'rahul@email.com',
  address: 'Mumbai, Maharashtra', dob: '1985-03-15', aadhaar: '1234 5678 9012', pan: 'ABCDE1234F',
}

const MOCK_POLICIES = [
  { id: 1, policyNumber: 'LIC-2024-001', type: 'Life', company: 'LIC', premiumAmount: 5000, expiryDate: '2026-12-31', status: 'active' },
  { id: 2, policyNumber: 'HDR-2025-042', type: 'Health', company: 'HDFC', premiumAmount: 3500, expiryDate: '2026-07-15', status: 'active' },
  { id: 3, policyNumber: 'BAJ-2023-118', type: 'Vehicle', company: 'Bajaj', premiumAmount: 2200, expiryDate: '2025-09-30', status: 'expired' },
]

function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(MOCK_CUSTOMER)
  const [policies, setPolicies] = useState(MOCK_POLICIES)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [custRes, polRes] = await Promise.all([
          customersAPI.getById(id),
          policiesAPI.getByCustomer(id),
        ])
        setCustomer(custRes.data)
        setPolicies(polRes.data)
      } catch { /* use mock data */ }
      finally { setLoading(false) }
    }
    fetchData()
  }, [id])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const formatCurrency = (n) => n ? '₹' + Number(n).toLocaleString('en-IN') : '—'

  return (
    <div className="page-container page-fade-in">
      {/* Back button */}
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers')} style={{ marginBottom: '16px' }}>
        ← Back to Customers
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
            <p className="page-subtitle">📱 {customer.mobile} · 📧 {customer.email}</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/policies')}>+ Add Policy</button>
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
      <div className="card">
        <div className="card-header">
          <div className="card-title">Policies</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/policies')}>+ New Policy</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Policy Number</th>
                <th>Type</th>
                <th>Company</th>
                <th>Premium</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500, fontFamily: 'monospace' }}>{p.policyNumber}</td>
                  <td>{p.type}</td>
                  <td>{p.company}</td>
                  <td>{formatCurrency(p.premiumAmount)}</td>
                  <td>{formatDate(p.expiryDate)}</td>
                  <td><Badge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CustomerDetailPage
