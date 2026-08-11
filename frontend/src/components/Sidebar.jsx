import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.email?.toLowerCase() === 'swayamkataria.dev@gmail.com';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/vehicles', label: 'Vehicles & Fleet', icon: '🚛' },
    { path: '/import', label: isAdmin ? 'Bulk Excel Import' : 'Excel Import (Admin Only)', icon: '📥' },
    { path: '/profile', label: 'Profile & Reminders', icon: '⚙️' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="hide-desktop"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 25, 55, 0.4)',
            zIndex: 199,
          }}
        />
      )}

      <aside style={{
        width: 'var(--sidebar-width)',
        backgroundColor: '#FFFFFF',
        borderRight: '2px solid var(--color-border)',
        height: 'calc(100vh - var(--header-height))',
        position: 'fixed',
        top: 'var(--header-height)',
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--space-4)',
        transition: 'transform var(--transition-slow)',
        zIndex: 200,
        transform: typeof window !== 'undefined' && window.innerWidth <= 768
          ? (isOpen ? 'translateX(0)' : 'translateX(-100%)')
          : 'translateX(0)',
        overflowY: 'auto',
      }}>
        {/* Portal Header */}
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          marginBottom: 'var(--space-4)',
          backgroundColor: 'var(--color-primary-light)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--color-primary)',
        }}>
          <p style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 800,
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Navigation Menu
          </p>
          <p style={{
            fontSize: '0.72rem',
            color: 'var(--color-text-muted)',
            marginTop: '2px',
          }}>
            Vehicle Compliance System
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/vehicles' && location.pathname.startsWith('/vehicles/'));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  borderLeft: isActive ? '4px solid var(--color-accent)' : '4px solid transparent',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info box */}
        <div style={{
          marginTop: 'auto',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-accent-light)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-warning-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '18px' }}>🔔</span>
            <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)' }}>
              Automated Reminders
            </p>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Insurance, PUC & Road Tax expiry alerts sent across Email, SMS & WhatsApp.
          </p>
        </div>
      </aside>
    </>
  );
}
