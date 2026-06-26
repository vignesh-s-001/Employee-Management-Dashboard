export default function EmptyState({ icon = '👤', title = 'No records found', subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 style={{ color: 'var(--color-text)' }}>{title}</h3>
      {subtitle && <p style={{ maxWidth: 360 }}>{subtitle}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
