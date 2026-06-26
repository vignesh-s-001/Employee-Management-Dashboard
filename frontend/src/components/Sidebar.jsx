import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard',  label: 'Dashboard',  icon: '📊' },
  { path: '/employees',  label: 'Employees',  icon: '👥' },
  { path: '/analytics',  label: 'Analytics',  icon: '📈' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">👨‍💼</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)' }}>EmpDash</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Management Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-label">Main Menu</div>
        {NAV_ITEMS.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            id={`nav-${label.toLowerCase()}`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / User */}
      <div className="sidebar-footer">
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          padding: '10px 12px', borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface-2)', marginBottom: 10,
        }}>
          <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
            {user?.name?.slice(0, 2) || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{user?.role}</div>
          </div>
        </div>
        <button id="sidebar-logout-btn" className="btn btn-ghost w-full" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
