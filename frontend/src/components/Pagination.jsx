import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  return (
    <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
      <button 
        className="btn btn-secondary" 
        disabled={currentPage <= 1} 
        onClick={() => onPageChange(currentPage - 1)}
        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        <FiChevronLeft /> Previous
      </button>
      
      <span style={{ fontWeight: 500 }}>
        Page {currentPage} of {totalPages}
      </span>
      
      <button 
        className="btn btn-secondary" 
        disabled={currentPage >= totalPages} 
        onClick={() => onPageChange(currentPage + 1)}
        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        Next <FiChevronRight />
      </button>
    </div>
  )
}

export default Pagination
