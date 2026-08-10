export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-16) var(--space-8)',
      textAlign: 'center',
    }}>
      {icon && (
        <div style={{
          fontSize: '48px',
          marginBottom: 'var(--space-4)',
          opacity: 0.6,
        }}>
          {icon}
        </div>
      )}
      <h3 style={{
        fontSize: 'var(--font-size-lg)',
        color: 'var(--color-text)',
        marginBottom: 'var(--space-2)',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-base)',
          maxWidth: '400px',
          marginBottom: action ? 'var(--space-6)' : 0,
        }}>
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
}
