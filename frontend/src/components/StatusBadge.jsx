export default function StatusBadge({ status }) {
  const config = {
    active: { label: 'Active', className: 'badge-active', dot: '#22C55E' },
    expiring: { label: 'Expiring Soon', className: 'badge-expiring', dot: '#F59E0B' },
    expired: { label: 'Expired', className: 'badge-expired', dot: '#EF4444' },
  };

  const { label, className, dot } = config[status] || config.active;

  return (
    <span className={`badge ${className}`}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: dot,
        flexShrink: 0,
      }}></span>
      {label}
    </span>
  );
}
