export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-state">
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h3 style={{ color: 'var(--color-danger)' }}>Something went wrong</h3>
      <p style={{ maxWidth: 360 }}>{message || 'An unexpected error occurred. Please try again.'}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry} style={{ marginTop: 8 }}>
          Retry
        </button>
      )}
    </div>
  );
}
