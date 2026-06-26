export default function StatCard({ icon, label, value, color = '#6c63ff', trend }) {
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="stat-card-icon" style={{ background: `${color}22`, color }}>
        {icon}
      </div>
      <div className="stat-card-value" style={{ color }}>
        {value}
      </div>
      <div className="stat-card-label">{label}</div>
      {trend !== undefined && (
        <div
          style={{
            marginTop: 8,
            fontSize: '0.8rem',
            color: trend >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
            fontWeight: 600,
          }}
        >
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );
}
