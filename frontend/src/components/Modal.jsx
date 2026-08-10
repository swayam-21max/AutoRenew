export default function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-6)',
          }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)' }}>{title}</h3>
            <button
              className="btn-ghost"
              onClick={onClose}
              style={{
                padding: '4px 8px',
                fontSize: '18px',
                lineHeight: 1,
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                color: 'var(--color-text-muted)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              ✕
            </button>
          </div>
        )}
        <div>{children}</div>
        {footer && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-6)',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
