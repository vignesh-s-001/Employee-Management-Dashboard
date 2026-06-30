function StatusBadge({ status }) {
  const cls =
    status === 'Active'   ? 'badge badge-active'   :
    status === 'Inactive' ? 'badge badge-inactive' :
                            'badge badge-leave';
  const dot =
    status === 'Active'   ? '#22c55e' :
    status === 'Inactive' ? '#ef4444' : '#f59e0b';

  return (
    <span className={cls}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />
      {status}
    </span>
  );
}

export default function EmployeeTable({ employees, onEdit, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="data-table" id="employees-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Status</th>
            <th>Joining Date</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              {/* Employee Name + Avatar */}
              <td data-label="Employee">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar">{emp.avatar || emp.name?.slice(0,2).toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{emp.email}</div>
                  </div>
                </div>
              </td>

              <td data-label="Department">
                <span style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  padding: '2px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                }}>
                  {emp.department}
                </span>
              </td>

              <td data-label="Designation" style={{ color: 'var(--color-text-muted)' }}>{emp.designation}</td>

              <td data-label="Status"><StatusBadge status={emp.status} /></td>

              <td data-label="Joined" style={{ color: 'var(--color-text-muted)' }}>
                {new Date(emp.joiningDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </td>

              <td>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button
                    id={`edit-employee-${emp.id}`}
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => onEdit(emp)}
                    title="Edit employee"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    ✏️
                  </button>
                  <button
                    id={`delete-employee-${emp.id}`}
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => onDelete(emp)}
                    title="Delete employee"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
