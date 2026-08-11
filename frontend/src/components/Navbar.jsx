import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="main-header">
      {/* Top Utility Bar */}
      <div className="top-utility-bar hide-mobile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span>🚛 Vehicle Compliance Reminder Platform</span>
          <span>•</span>
          <span>🔒 Enterprise Fleet Security</span>
          <span>•</span>
          <span>⚡ Automated Expiry Engine</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>24/7 Automated Reminder Engine Active</span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="header-container">
        {/* Brand Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button
            className="btn-ghost hide-desktop"
            onClick={onToggleSidebar}
            style={{ fontSize: '22px', padding: '6px', color: 'var(--color-primary)' }}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <Link to="/" className="brand-emblem">
            <div className="emblem-badge">
              A
            </div>
            <div className="brand-titles">
              <span className="brand-name">AutoRenew</span>
              <span className="brand-tagline">Vehicle Compliance Platform</span>
            </div>
          </Link>
        </div>

        {/* User Account Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {user ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background var(--transition-fast)',
                }}
                onClick={() => navigate('/profile')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 700,
                  border: '2px solid var(--color-accent)',
                }}>
                  {initials}
                </div>
                <div className="hide-mobile" style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.2 }}>
                    {user.fullName}
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    Fleet Account
                  </p>
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-accent btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
