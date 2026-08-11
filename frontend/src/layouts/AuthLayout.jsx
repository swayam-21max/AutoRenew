import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg-secondary)',
      padding: 'var(--space-6)',
    }}>
      <div className="animate-scale-in" style={{
        width: '100%',
        maxWidth: '440px',
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-8)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '22px',
            fontWeight: 800,
            marginBottom: 'var(--space-4)',
          }}>
            A
          </div>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--color-text)',
          }}>
            AutoRenew
          </h1>
          <p style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
            marginTop: 'var(--space-1)',
          }}>
            Vehicle Compliance & Expiry Reminder Platform
          </p>
        </div>

        {/* Card */}
        <div className="card card-elevated" style={{
          padding: 'var(--space-8)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <Outlet />
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: 'var(--space-6)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-light)',
        }}>
          © {new Date().getFullYear()} AutoRenew. All rights reserved.
        </p>
      </div>
    </div>
  );
}
