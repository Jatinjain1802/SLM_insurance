import React from 'react'
import { FiSearch } from 'react-icons/fi'

function FilterBar({ 
  search, 
  onSearchChange, 
  searchPlaceholder = "Search...", 
  filterOptions = [], 
  activeFilter = '', 
  onFilterChange,
  actions 
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--bg-border)',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--bg-elevated)',
        borderRadius: '12px 12px 0 0',
      }}
    >
      <div className="search-bar">
        <span className="search-bar-icon"><FiSearch /></span>
        <input
          className="search-input"
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {filterOptions.length > 0 && (
          <div className="filter-dropdown">
            <select 
              className="form-control" 
              value={activeFilter} 
              onChange={(e) => onFilterChange(e.target.value)}
              style={{ minWidth: '120px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--bg-border)', background: 'var(--bg-base)' }}
            >
              {filterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
        {actions && <div>{actions}</div>}
      </div>
    </div>
  )
}

export default FilterBar
