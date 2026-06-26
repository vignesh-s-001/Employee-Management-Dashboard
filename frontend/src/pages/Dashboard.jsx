import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useEmployees } from '../context/EmployeeContext';

export default function Dashboard() {
  const { employees, loading, error, fetchEmployees } = useEmployees();
  const navigate = useNavigate();

  useEffect(() => {
    if (employees.length === 0) fetchEmployees();
  }, []);

  // Compute analytics
  const total    = employees.length;
  const active   = employees.filter((e) => e.status === 'Active').length;
  const inactive = employees.filter((e) => e.status === 'Inactive').length;
  const onLeave  = employees.filter((e) => e.status === 'On Leave').length;

  // Department breakdown
  const deptMap = employees.reduce((acc, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {});
  const topDept = Object.entries(deptMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Recent joins (last 5)
  const recent = [...employees]
    .sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate))
    .slice(0, 5);

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar title="Dashboard" subtitle="Overview of your organization" />
      <LoadingSpinner />
    </div>
  );

  if (error) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar title="Dashboard" subtitle="Overview of your organization" />
      <ErrorMessage message={error} onRetry={fetchEmployees} />
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar title="Dashboard" subtitle="Overview of your organization" />

      <div className="page-wrapper">
        {/* Stat Cards */}
        <div className="stat-grid">
          <StatCard icon="👥" label="Total Employees" value={total}     color="#6c63ff" trend={5}  />
          <StatCard icon="✅" label="Active"           value={active}    color="#22c55e" trend={2}  />
          <StatCard icon="❌" label="Inactive"         value={inactive}  color="#ef4444" trend={-1} />
          <StatCard icon="🏖️" label="On Leave"         value={onLeave}   color="#f59e0b"            />
        </div>

        {/* Two Column Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
          {/* Department Breakdown */}
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>🏢 Department Breakdown</h3>
            {Object.entries(deptMap)
              .sort((a, b) => b[1] - a[1])
              .map(([dept, count]) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={dept} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{dept}</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div style={{
                      height: 8, background: 'var(--color-surface-2)', borderRadius: 99,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #6c63ff, #4facfe)',
                        borderRadius: 99,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Recent Joiners */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>🆕 Recent Joiners</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/employees')}>
                View All →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recent.map((emp) => (
                <div key={emp.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px',
                  background: 'var(--color-surface-2)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}>
                  <div className="avatar">{emp.avatar || emp.name?.slice(0,2)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{emp.designation}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                    {new Date(emp.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Navigate */}
        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/employees')}>
            👥 Manage Employees
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/analytics')}>
            📈 View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
