import { useState, useRef } from 'react'
import Modal from './Modal'
import { FiUploadCloud, FiInfo, FiCheck, FiAlertTriangle } from 'react-icons/fi'

function CompanyBulkUploadModal({ isOpen, onClose, onUploadComplete }) {
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
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '')
    if (lines.length < 2) throw new Error('CSV file is empty or has no data rows.')
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    const headerMap = {
      name: 'name',
      code: 'code',
      type: 'type',
      contact: 'contactDetails',
      contactdetails: 'contactDetails',
    }

    const companies = []
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(v => v.trim())
      const company = {}
      headers.forEach((h, index) => {
        const dbField = headerMap[h]
        if (dbField && row[index]) {
          company[dbField] = row[index]
        }
      })
      if (Object.keys(company).length > 0) {
        companies.push(company)
      }
    }
    return companies
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
        const companiesData = parseCSV(text)
        
        if (companiesData.length === 0) {
          throw new Error('No valid companies found in the file.')
        }

        await onUploadComplete(companiesData)
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Upload Insurance Companies" size="lg">
      <div className="modal-body">
        <div className="alert alert-info" style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <FiInfo size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ minWidth: 0, width: '100%' }}>
            <strong>CSV Format Instructions</strong>
            <p style={{ marginTop: '4px', marginBottom: '12px', fontSize: '13px', lineHeight: '1.5' }}>
              Your CSV file must have a header row matching these columns. <br/>
              <b>name</b>, <b>code</b>, and <b>type</b> are required.
              Type must be one of: <i>Life, General, Health, Travel</i>
            </p>
            <div className="table-container" style={{ overflowX: 'auto', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                <thead style={{ background: 'rgba(0,0,0,0.1)' }}>
                  <tr>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)', color: 'var(--text-secondary)' }}>NAME</th>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)', color: 'var(--text-secondary)' }}>CODE</th>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)', color: 'var(--text-secondary)' }}>TYPE</th>
                    <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)', color: 'var(--text-secondary)' }}>CONTACT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)' }}>Life Insurance Corp</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)' }}>LIC</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)' }}>Life</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg-border)' }}>1800-123-456</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 12px' }}>Star Health</td>
                    <td style={{ padding: '8px 12px' }}>STAR</td>
                    <td style={{ padding: '8px 12px' }}>Health</td>
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

export default CompanyBulkUploadModal
