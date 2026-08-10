export default function StatsCard({ icon, label, value, color, delay }) {
  const colorMap = {
    primary: { bg: '#EFF6FF', text: '#2563EB' },
    success: { bg: '#F0FDF4', text: '#22C55E' },
    warning: { bg: '#FFFBEB', text: '#F59E0B' },
    danger: { bg: '#FEF2F2', text: '#EF4444' },
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <div className={`card card-elevated animate-slide-up ${delay || ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-2)',
            fontWeight: 500,
          }}>
            {label}
          </p>
          <p style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}>
            {value}
          </p>
        </div>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
      {/* Subtle accent bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${colors.text}, transparent)`,
        opacity: 0.3,
      }}></div>
    </div>
  );
}
