import { useState, useRef } from 'react'
import Modal from './Modal'
import { FiUploadCloud, FiInfo, FiCheck, FiAlertTriangle } from 'react-icons/fi'

function BulkUploadModal({ isOpen, onClose, onUploadComplete }) {
  const [file, setFile] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected && selected.name.endsWith('.csv')) {
      setFile(selected)
      setError('')
    } else {
      setFile(null)
      setError('Please select a valid .csv file.')
    }
  }

  const parseCSV = (text) => {
    // Simple CSV parser that handles newlines
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '')
    if (lines.length < 2) throw new Error('CSV file is empty or has no data rows.')
    
    // Get headers and normalize them
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    // Map expected CSV headers to DB fields
    const headerMap = {
      name: 'name',
      mobile: 'mobile',
      email: 'email',
      address: 'address',
      dob: 'dob',
      aadhaar: 'aadhaar',
      pan: 'pan'
    }

    const customers = []
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(v => v.trim())
      const customer = {}
      headers.forEach((h, index) => {
        const dbField = headerMap[h]
        if (dbField && row[index]) {
          customer[dbField] = row[index]
        }
      })
      if (Object.keys(customer).length > 0) {
        customers.push(customer)
      }
    }
    return customers
  }

  const handleUpload = () => {
    if (!file) {
      setError('Please select a file first.')
      return
    }

    setParsing(true)
    setError('')

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target.result
        const customersData = parseCSV(text)
        
        if (customersData.length === 0) {
          throw new Error('No valid customers found in the file.')
        }

        // Call parent prop to trigger the API request
        await onUploadComplete(customersData)
        // Reset and close on success
        setFile(null)
        onClose()
      } catch (err) {
        setError(err.message || 'Failed to parse CSV file. Please check the format.')
      } finally {
        setParsing(false)
      }
    }
    reader.onerror = () => {
      setError('Failed to read file.')
      setParsing(false)
    }
    reader.readAsText(file)
  }

  const handleClose = () => {
    setFile(null)
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Upload Customers" size="lg">
      <div className="modal-body">
        <div className="alert alert-info" style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <FiInfo size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ minWidth: 0, width: '100%' }}>
            <strong>CSV Format Instructions</strong>
            <p style={{ marginTop: '4px', marginBottom: '12px', fontSize: '13px', lineHeight: '1.5' }}>
              Your CSV file must have a header row matching these columns. <br/>
              <b>name</b> and <b>mobile</b> are required.
            </p>
            <div className="table-container" style={{ overflowX: 'auto', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                <thead style={{ background: 'rgba(0,0,0,0.1)' }}>
                  <tr>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)', color: 'var(--text-secondary)' }}>NAME</th>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)', color: 'var(--text-secondary)' }}>MOBILE</th>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)', color: 'var(--text-secondary)' }}>EMAIL</th>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)', color: 'var(--text-secondary)' }}>ADDRESS</th>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)', color: 'var(--text-secondary)' }}>DOB</th>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)', color: 'var(--text-secondary)' }}>AADHAAR</th>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)', color: 'var(--text-secondary)' }}>PAN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)' }}>Rahul Sharma</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)' }}>9876543210</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)' }}>rahul@email.com</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)' }}>Mumbai</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)' }}>1990-05-15</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)' }}>123456789012</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)' }}>ABCDE1234F</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 12px' }}>Priya Patel</td>
                    <td style={{ padding: '8px 12px' }}>9876543211</td>
                    <td style={{ padding: '8px 12px' }}>priya@email.com</td>
                    <td style={{ padding: '8px 12px' }}>Delhi</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}><i>empty</i></td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}><i>empty</i></td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}><i>empty</i></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiAlertTriangle /> {error}
          </div>
        )}

        <div 
          style={{ 
            border: '2px dashed var(--bg-border)', 
            borderRadius: '12px', 
            padding: '40px 20px', 
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--bg-elevated)',
            transition: 'border 0.2s ease'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
          <FiUploadCloud size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          {file ? (
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{(file.size / 1024).toFixed(1)} KB</div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Click to browse CSV file</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Only .csv files are supported</div>
            </div>
          )}
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
        <button type="button" className="btn btn-primary" onClick={handleUpload} disabled={parsing || !file} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {parsing ? 'Processing...' : <><FiCheck /> Upload & Import</>}
        </button>
      </div>
    </Modal>
  )
}

export default BulkUploadModal
