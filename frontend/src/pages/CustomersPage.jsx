// pages/CustomersPage.jsx
// LEARNING NOTE:
// This page shows the full customer list with Add/Edit/Delete.
// We manage the modal open/close with useState.
// The form resets to empty when adding a new customer,
// or pre-fills with existing data when editing.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Pagination from '../components/Pagination'
import { customersAPI } from '../services/api'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'

// Removed MOCK_CUSTOMERS array

const EMPTY_FORM = {
  name: '', mobile: '', email: '', address: '', dob: '', aadhaar: '', pan: ''
}

function CustomersPage() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState(null) // null = Add mode, object = Edit mode
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // customer to delete

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      try {
        const res = await customersAPI.getAll({ page, limit: 10 })
        setCustomers(res.data.data)
        setTotalPages(res.data.totalPages)
      } catch (err) {
        console.error('Failed to fetch customers', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [page])

  // Open modal for ADDING a new customer
  const openAddModal = () => {
    setEditCustomer(null)  // null = Add mode
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  // Open modal for EDITING existing customer
  const openEditModal = (customer) => {
    setEditCustomer(customer)
    setForm({
      name: customer.name || '',
      mobile: customer.mobile || '',
      email: customer.email || '',
      address: customer.address || '',
      dob: customer.dob || '',
      aadhaar: customer.aadhaar || '',
      pan: customer.pan || '',
    })
    setModalOpen(true)
  }

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Save (Add or Update)
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editCustomer) {
        // Update existing
        await customersAPI.update(editCustomer.id, form)
        setCustomers(customers.map(c =>
          c.id === editCustomer.id ? { ...c, ...form } : c
        ))
      } else {
        // Add new
        const res = await customersAPI.create(form)
        setCustomers([res.data, ...customers])
      }
      setModalOpen(false)
    } catch (err) {
      console.error('Save failed', err)
      alert(err.response?.data?.message || 'Failed to save customer.')
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  // Delete customer
  const handleDelete = async (customer) => {
    try {
      await customersAPI.delete(customer.id)
      setCustomers(customers.filter(c => c.id !== customer.id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete failed', err)
      alert('Failed to delete customer.')
      setDeleteConfirm(null)
    }
  }

  // Table columns definition
  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0
          }}>
            {val?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.email}</div>
          </div>
        </div>
      )
    },
    { key: 'mobile', label: 'Mobile' },
    { key: 'address', label: 'Address' },
    {
      key: 'policies',
      label: 'Policies',
      render: (val) => (
        <span style={{
          background: 'rgba(59,130,246,0.15)', color: 'var(--primary-400)',
          padding: '2px 10px', borderRadius: '9999px', fontWeight: 600, fontSize: 12
        }}>
          {val?.length || 0}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge status={val || 'active'} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/customers/${row.id}`) }}
          >
            View
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => { e.stopPropagation(); openEditModal(row) }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <FiEdit2 /> Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row) }}
          >
            <FiTrash2 />
          </button>
        </div>
      )
    },
  ]

  return (
    <div className="page-container page-fade-in">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p className="page-subtitle">{customers.length} total customers</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} id="add-customer-btn">
          + Add Customer
        </button>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchPlaceholder="Search by name, mobile, email..."
        emptyMessage="No customers found"
        emptyIcon="👥"
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
      />

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />

      {/* ---- Add / Edit Modal ---- */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="lg"
      >
        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name <span className="form-required">*</span></label>
                <input name="name" className="form-control" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" required />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number <span className="form-required">*</span></label>
                <input name="mobile" className="form-control" value={form.mobile} onChange={handleChange} placeholder="9876543210" required maxLength={10} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} placeholder="customer@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input name="dob" type="date" className="form-control" value={form.dob} onChange={handleChange} />
              </div>
              <div className="form-group form-span-2">
                <label className="form-label">Address</label>
                <input name="address" className="form-control" value={form.address} onChange={handleChange} placeholder="City, State" />
              </div>
              <div className="form-group">
                <label className="form-label">Aadhaar Number</label>
                <input name="aadhaar" className="form-control" value={form.aadhaar} onChange={handleChange} placeholder="XXXX XXXX XXXX" maxLength={12} />
              </div>
              <div className="form-group">
                <label className="form-label">PAN Number</label>
                <input name="pan" className="form-control" value={form.pan} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editCustomer ? '✓ Update Customer' : '+ Add Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ---- Delete Confirmation Modal ---- */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Customer"
      >
        <div className="modal-body">
          <div className="alert alert-error">
            ⚠️ Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
            This will also delete all their policies and documents. This action cannot be undone.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiTrash2 /> Yes, Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default CustomersPage
