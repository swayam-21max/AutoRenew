export default function LoadingSpinner({ size = 'default', text = '' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-4)',
      padding: 'var(--space-12)',
    }}>
      <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`}></div>
      {text && (
        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-sm)',
        }}>
          {text}
        </p>
      )}
    </div>
  );
}
