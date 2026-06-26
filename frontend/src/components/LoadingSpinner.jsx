export default function LoadingSpinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="spinner-wrapper">
      <div className="spinner" />
    </div>
  );
}
