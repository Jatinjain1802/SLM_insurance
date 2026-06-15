// components/StatCard.jsx
// LEARNING NOTE:
// Props are how a parent component passes data to a child component.
// Here, DashboardPage will pass: label, value, icon, color, change, changeType
// This component just displays them — it doesn't need to know anything else.

function StatCard({ label, value, icon, color = 'blue', change, changeType }) {
  return (
    <div className={`stat-card ${color}`}>
      {/* Top row: label + icon */}
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon">{icon}</div>
      </div>

      {/* Big number */}
      <div className="stat-card-value">{value}</div>

      {/* Optional change indicator (e.g., "+12% this month") */}
      {change && (
        <div className={`stat-card-change ${changeType || 'up'}`}>
          {changeType === 'down' ? '▼' : '▲'} {change}
        </div>
      )}
    </div>
  )
}

export default StatCard
