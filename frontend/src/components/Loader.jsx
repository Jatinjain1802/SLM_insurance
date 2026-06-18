import React from 'react'

const Loader = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      minHeight: '200px'
    }}>
      <div className="spinner" style={{
        width: '40px',
        height: '40px',
        border: '4px solid var(--border-color)',
        borderTop: '4px solid var(--primary-500)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default Loader
