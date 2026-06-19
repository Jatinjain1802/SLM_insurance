// components/DataTable.jsx
// LEARNING NOTE:
// This is a reusable table component. Instead of writing a new table
// for every page, we pass:
//   - columns: array of { key, label, render } objects
//   - data: array of row objects
//   - loading: boolean
// The "render" function in a column lets you customize how a cell looks.

import { useState } from 'react'
import HighlightText from './HighlightText'
import { FiSearch } from 'react-icons/fi'

function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  onRowClick,
  emptyMessage = 'No data found',
  emptyIcon = '📭',
  actions,           // Optional: element to render on the right of search bar
  filterOptions = [], // Optional: array of { label, value } for a filter dropdown
  activeFilter = '',
  onFilterChange,
}) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  // Filter rows by search term (checks all values in each row)
  const filtered = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  )

  // Pagination math
  const totalPages = Math.ceil(filtered.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginated = filtered.slice(startIndex, startIndex + rowsPerPage)

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Search Bar + Actions Row */}
      {(searchable || actions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--bg-border)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {searchable && (
            <div className="search-bar">
              <span className="search-bar-icon"><FiSearch /></span>
              <input
                className="search-input"
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1) // Reset to page 1 on new search
                }}
              />
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {filterOptions.length > 0 && (
              <div className="filter-dropdown">
                <select 
                  className="form-control" 
                  value={activeFilter} 
                  onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
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
      )}

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Loading state */}
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="spinner" />
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              /* Empty state */
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state">
                    <div className="empty-state-icon">{emptyIcon}</div>
                    <h3>{emptyMessage}</h3>
                    <p>Try adjusting your search or add new records.</p>
                  </div>
                </td>
              </tr>
            ) : (
              /* Data rows */
              paginated.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {/* If column has a custom render function, pass search term; otherwise use HighlightText */}
                      {col.render 
                        ? col.render(row[col.key], row, search) 
                        : <HighlightText text={row[col.key]} highlight={search} />}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > rowsPerPage && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {startIndex + 1}–{Math.min(startIndex + rowsPerPage, filtered.length)} of {filtered.length}
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ‹
            </button>
            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="pagination-btn" style={{ cursor: 'default' }}>…</span>
                  )}
                  <button
                    className={`pagination-btn ${currentPage === p ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
