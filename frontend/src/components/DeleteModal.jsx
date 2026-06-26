export default function DeleteModal({ isOpen, employee, onConfirm, onCancel, loading }) {
  if (!isOpen || !employee) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal" id="delete-modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.1rem', color: 'var(--color-danger)' }}>🗑️ Delete Employee</h2>
          <button className="btn btn-ghost btn-icon" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body" style={{ paddingTop: 16 }}>
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', flexShrink: 0 }}>
                {employee.avatar || employee.name?.slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{employee.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{employee.email}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {employee.designation} · {employee.department}
                </div>
              </div>
            </div>
          </div>

          <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>{employee.name}</strong>?
            This action <strong>cannot be undone</strong>.
          </p>
        </div>

        <div className="modal-footer">
          <button id="delete-cancel-btn" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button id="delete-confirm-btn" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
