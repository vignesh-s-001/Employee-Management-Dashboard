import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      {/* Left: Page title */}
      <div>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{subtitle}</p>
        )}
      </div>

      {/* Right: User + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Date */}
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>

        {/* User chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '6px 14px 6px 6px',
        }}>
          <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>
            {user?.name?.slice(0, 2) || 'U'}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</span>
        </div>

        <button id="navbar-logout-btn" className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
          🚪
        </button>
      </div>
    </header>
  );
}
