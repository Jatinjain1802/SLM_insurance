import React from 'react'
import Modal from './Modal'
import StatCard from './StatCard'
import Badge from './Badge'
import { FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const formatCurrency = (n) => (n !== null && n !== undefined && n !== '') ? '₹' + Number(n).toLocaleString('en-IN') : '—'

export default function ViewPolicyModal({ isOpen, onClose, viewPolicy }) {
  if (!viewPolicy) return null

  // Calculate Duration
  let totalMonths = 'N/A'
  if (viewPolicy.startDate && viewPolicy.expiryDate) {
    const start = new Date(viewPolicy.startDate)
    const end = new Date(viewPolicy.expiryDate)
    totalMonths = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.44))) + ' Months'
  }

  // Calculate Premiums
  const premiums = viewPolicy.premiums || []
  const paidPremiums = premiums.filter(p => p.status === 'paid')
  const pendingPremiums = premiums.filter(p => p.status !== 'paid')
  
  const paidCount = paidPremiums.length
  const pendingCount = pendingPremiums.length

  const totalPaidAmount = paidPremiums.reduce((sum, p) => sum + Number(p.amount), 0)

  // Sort premiums by due date
  const sortedPremiums = [...premiums].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  
  // Find next upcoming premium
  const upcomingPremium = sortedPremiums.find(p => p.status === 'upcoming')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Policy Details & Premium Analytics" size="lg">
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Analytics Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <StatCard 
            label="Policy Duration" 
            value={totalMonths} 
            icon={<FiCalendar />}
            color="blue" 
          />
          <StatCard 
            label="Paid Premiums" 
            value={paidCount} 
            icon={<FiCheckCircle />}
            color="green" 
          />
          <StatCard 
            label="Pending / Overdue" 
            value={pendingCount} 
            icon={<FiClock />}
            color="orange" 
          />
        </div>

        {/* Detailed Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', background: 'var(--bg-elevated)', padding: '20px', borderRadius: '8px', border: '1px solid var(--bg-border)' }}>
          
          {/* Customer Info */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Customer Info</h4>
            <p style={{ margin: '4px 0', fontWeight: 500 }}>{viewPolicy.customer?.name}</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{viewPolicy.customer?.mobile}</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{viewPolicy.customer?.email}</p>
          </div>

          {/* Policy Schedule */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Schedule & Details</h4>
            <p style={{ margin: '4px 0', fontWeight: 500 }}>{viewPolicy.policyNumber} <Badge status={viewPolicy.status} /></p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Type: {viewPolicy.policyType}</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Start Date: {formatDate(viewPolicy.startDate)}</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>End (Expiry): {formatDate(viewPolicy.expiryDate)}</p>
          </div>

          {/* Financials */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Financials</h4>
            <p style={{ margin: '4px 0', fontWeight: 500 }}>Premium Cost: {formatCurrency(viewPolicy.premiumAmount)}</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Frequency: <span style={{textTransform: 'capitalize'}}>{viewPolicy.paymentFrequency}</span></p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Company: {viewPolicy.company?.name}</p>
            <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>
              Total Paid: {formatCurrency(totalPaidAmount)}
            </p>
          </div>
        </div>

        {/* Premium History Table */}
        <div>
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '14px' }}>Premium History</h4>
          {sortedPremiums.length > 0 ? (
            <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table style={{ width: '100%', fontSize: '13px' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-elevated)', zIndex: 1 }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Due Date</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Paid On</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPremiums.map(prem => (
                    <tr key={prem.id} style={{ borderBottom: '1px solid var(--bg-border)' }}>
                      <td style={{ padding: '8px' }}>
                        {formatDate(prem.dueDate)}
                        {upcomingPremium?.id === prem.id && (
                          <span style={{ marginLeft: '8px', fontSize: '11px', background: 'var(--info)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>Next</span>
                        )}
                      </td>
                      <td style={{ padding: '8px', fontWeight: 500 }}>{formatCurrency(prem.amount)}</td>
                      <td style={{ padding: '8px' }}><Badge status={prem.status} /></td>
                      <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                        {prem.status === 'paid' ? formatDate(prem.paidDate || prem.updatedAt) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No premiums found for this policy.</div>
          )}
        </div>

      </div>
      <div className="modal-footer">
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  )
}
