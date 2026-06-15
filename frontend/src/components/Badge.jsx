// components/Badge.jsx
// LEARNING NOTE:
// This is a tiny presentational component — it just shows a colored pill.
// We map a "status" string to a CSS class and a display label.

// Map each policy/premium status → CSS class
const STATUS_CLASS = {
  active:   'badge-active',
  expired:  'badge-expired',
  pending:  'badge-pending',
  renewed:  'badge-renewed',
  paid:     'badge-active',
  unpaid:   'badge-pending',
  overdue:  'badge-expired',
  upcoming: 'badge-renewed',
  owner:    'badge-renewed',
  admin:    'badge-active',
  agent:    'badge-pending',
}

function Badge({ status }) {
  const cssClass = STATUS_CLASS[status?.toLowerCase()] || 'badge-pending'
  return (
    <span className={`badge ${cssClass}`}>
      {status}
    </span>
  )
}

export default Badge
