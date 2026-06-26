import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);

  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  function validate() {
    const e = {};
    if (!form.email.trim())    e.email    = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password.trim()) e.password = 'Password is required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    const result = await login(form.email, form.password);
    if (result.success) navigate(from, { replace: true });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  }

  return (
    <div className="login-page">
      {/* Background Blobs */}
      <div className="login-bg-blob" style={{
        width: 600, height: 600, background: '#6c63ff',
        top: '-200px', left: '-200px',
      }} />
      <div className="login-bg-blob" style={{
        width: 400, height: 400, background: '#4facfe',
        bottom: '-100px', right: '-100px',
      }} />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">👨‍💼</div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--color-text)' }}>EmpDash</h1>
          <p style={{ marginTop: 4, fontSize: '0.9rem' }}>Sign in to your account</p>
        </div>

        {/* Demo credentials hint */}
        <div style={{
          background: 'rgba(108,99,255,0.1)',
          border: '1px solid rgba(108,99,255,0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: 24,
          fontSize: '0.82rem',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--color-accent)', marginBottom: 6 }}>Demo Credentials</div>
          <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
            📧 <strong>admin@nexatech.io</strong> / 🔑 <strong>admin123</strong><br />
            📧 <strong>hr@nexatech.io</strong> / 🔑 <strong>hr123</strong>
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-md)', padding: '12px 16px',
            color: 'var(--color-danger)', fontSize: '0.875rem', marginBottom: 20,
          }}>
            ⚠️ {error}
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label className="input-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@nexatech.io"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="input-group" style={{ marginBottom: 28 }}>
            <label className="input-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                id="toggle-password"
                onClick={() => setShowPwd((s) => !s)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem',
                }}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Signing in…
              </>
            ) : 'Sign In →'}
          </button>

          {/* Link to Signup */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
