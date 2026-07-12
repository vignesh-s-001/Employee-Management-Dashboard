import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const ROLES = ['employee', 'hr', 'admin'];

function validate(form) {
  const e = {};
  if (!form.name.trim())           e.name     = 'Full name is required';
  if (!form.email.trim())          e.email    = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
  if (!form.password)              e.password = 'Password is required';
  else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
  if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
  if (!form.role)                  e.role     = 'Please select a role';
  return e;
}

export default function Signup() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'employee' });
  const [errors, setErrors]   = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);

  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate(form);
    if (Object.keys(v).length) { setErrors(v); return; }
    const result = await signup(form.name, form.email, form.password, form.role);
    if (result.success) navigate('/dashboard', { replace: true });
  }

  return (
    <div className="login-page">
      {/* Background blobs */}
      <div className="login-bg-blob" style={{ width: 500, height: 500, background: '#4facfe', top: '-180px', right: '-150px' }} />
      <div className="login-bg-blob" style={{ width: 400, height: 400, background: '#6c63ff', bottom: '-120px', left: '-120px' }} />

      <div className="login-card" style={{ maxWidth: 480 }}>
        {/* Logo */}
        <div className="login-logo">
          <img src={logoImg} alt="E-Dash Logo" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%', marginBottom: 12 }} />
          <h1 style={{ fontSize: '1.5rem', color: 'var(--color-text)' }}>Create Account</h1>
          <p style={{ marginTop: 4, fontSize: '0.9rem' }}>Join E-Dash – NexaTech's HR Portal</p>
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

        <form id="signup-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="input-group" style={{ marginBottom: 14 }}>
            <label className="input-label" htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g. Alice Johnson"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="input-group" style={{ marginBottom: 14 }}>
            <label className="input-label" htmlFor="signup-email">Work Email</label>
            <input
              id="signup-email"
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

          {/* Role */}
          <div className="input-group" style={{ marginBottom: 14 }}>
            <label className="input-label" htmlFor="signup-role">Role</label>
            <select
              id="signup-role"
              name="role"
              className={`input ${errors.role ? 'input-error' : ''}`}
              value={form.role}
              onChange={handleChange}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
            {errors.role && <span className="error-text">{errors.role}</span>}
          </div>

          {/* Password */}
          <div className="input-group" style={{ marginBottom: 14 }}>
            <label className="input-label" htmlFor="signup-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                style={{ paddingRight: 48 }}
              />
              <button type="button" onClick={() => setShowPwd((s) => !s)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem' }}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="input-group" style={{ marginBottom: 28 }}>
            <label className="input-label" htmlFor="signup-confirm">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-confirm"
                name="confirmPassword"
                type={showCPwd ? 'text' : 'password'}
                autoComplete="new-password"
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                style={{ paddingRight: 48 }}
              />
              <button type="button" onClick={() => setShowCPwd((s) => !s)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem' }}>
                {showCPwd ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          {/* Strength indicator */}
          {form.password && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                Password strength: <strong style={{
                  color: form.password.length < 6 ? 'var(--color-danger)' :
                         form.password.length < 10 ? 'var(--color-warning)' : 'var(--color-success)'
                }}>
                  {form.password.length < 6 ? 'Weak' : form.password.length < 10 ? 'Fair' : 'Strong'}
                </strong>
              </div>
              <div style={{ height: 4, background: 'var(--color-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99, transition: 'width 0.3s ease, background 0.3s ease',
                  width: form.password.length < 6 ? '25%' : form.password.length < 10 ? '60%' : '100%',
                  background: form.password.length < 6 ? 'var(--color-danger)' :
                              form.password.length < 10 ? 'var(--color-warning)' : 'var(--color-success)',
                }} />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            id="signup-submit-btn"
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Creating account…
              </>
            ) : 'Create Account →'}
          </button>

          {/* Link to Login */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
