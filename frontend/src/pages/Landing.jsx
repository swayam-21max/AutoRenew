import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: '📊',
      title: 'Bulk Excel Fleet Import',
      desc: 'Upload .xlsx or .xls spreadsheets to import and organize your entire vehicle fleet in seconds.',
    },
    {
      icon: '🚨',
      title: 'Nearest-Expiry Priority Engine',
      desc: 'Automatically prioritizes Insurance, PUC, and Road Tax renewals by nearest expiry date.',
    },
    {
      icon: '📡',
      title: 'Multi-Channel Automated Alerts',
      desc: 'Dispatches automated reminder notifications across Email, SMS (MSG91/Twilio), and WhatsApp before expiries.',
    },
    {
      icon: '🔒',
      title: 'Enterprise Fleet Security',
      desc: 'Encrypted PostgreSQL storage with role-based JWT authentication, duplicate prevention, and admin audit copies.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* Announcement Bar */}
      <div style={{
        backgroundColor: 'var(--color-primary)',
        color: '#FFFFFF',
        padding: '8px var(--space-6)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid var(--color-accent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{
            backgroundColor: 'var(--color-accent)',
            color: '#FFFFFF',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '10px',
          }}>
            PLATFORM ACTIVE
          </span>
          <span>⚡ Automated Vehicle Compliance & Multi-Channel Reminder Platform is Live!</span>
        </div>
        <div className="hide-mobile" style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>Sign In →</Link>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0A2B5C 0%, #051937 100%)',
        color: '#FFFFFF',
        padding: 'var(--space-16) var(--space-6) var(--space-16)',
        position: 'relative',
        borderBottom: '4px solid var(--color-accent)',
        overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 'var(--space-10)',
          alignItems: 'center',
        }}>
          {/* Hero Left Content */}
          <div className="animate-slide-up">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              backgroundColor: 'rgba(217, 119, 6, 0.2)',
              border: '1px solid var(--color-accent)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-accent)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-6)',
            }}>
              <span>🚛</span> VEHICLE COMPLIANCE PLATFORM
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 4.2vw, 3.4rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.15,
              marginBottom: 'var(--space-6)',
              letterSpacing: '-0.02em',
            }}>
              Never miss Insurance, PUC & <br />
              <span style={{ color: 'var(--color-accent)' }}>Road Tax renewal deadlines</span>
            </h1>

            <p style={{
              fontSize: 'var(--font-size-lg)',
              color: '#D0E1FD',
              lineHeight: 1.7,
              marginBottom: 'var(--space-8)',
              maxWidth: '540px',
            }}>
              AutoRenew helps transport operators, fleet managers, schools, and dealerships import Excel sheets, monitor vehicle compliance expiries, and send multi-channel reminders.
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
              <Link to="/register" className="btn btn-accent btn-lg" style={{
                fontSize: 'var(--font-size-base)',
                padding: '14px 28px',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
              }}>
                Get Started Free →
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg" style={{
                fontSize: 'var(--font-size-base)',
                padding: '14px 24px',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                borderColor: '#D0E1FD',
              }}>
                Sign In to Account
              </Link>
            </div>

            {/* Quick Metrics Badges */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-6)',
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-accent)', margin: 0 }}>100%</p>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>Automated Expiry Alerts</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>09:00 AM</p>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>Daily Automated Cron</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#4ADE80', margin: 0 }}>3 Channels</p>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>Email + SMS + WhatsApp</p>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Demo Card (Executive Showcase) */}
          <div className="animate-slide-up delay-1" style={{
            backgroundColor: '#FFFFFF',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            borderTop: '6px solid var(--color-accent)',
            overflow: 'hidden',
          }}>
            {/* Mock Header */}
            <div style={{
              backgroundColor: '#F8FAFC',
              padding: 'var(--space-4) var(--space-6)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)', marginLeft: '8px' }}>
                  AutoRenew Fleet Dashboard
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '12px' }}>
                ● Active Protection
              </span>
            </div>

            {/* Mock Content */}
            <div style={{ padding: 'var(--space-6)' }}>
              {/* Stat Summary Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-5)',
              }}>
                <div style={{ backgroundColor: '#F0F9FF', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid #BAE6FD', textAlign: 'center' }}>
                  <p style={{ fontSize: '10px', color: '#0369A1', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>Fleet Vehicles</p>
                  <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#0284C7', margin: '2px 0 0' }}>124</p>
                </div>
                <div style={{ backgroundColor: '#FEFCE8', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid #FEF08A', textAlign: 'center' }}>
                  <p style={{ fontSize: '10px', color: '#A16207', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>Expiring Soon</p>
                  <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#CA8A04', margin: '2px 0 0' }}>5</p>
                </div>
                <div style={{ backgroundColor: '#F0FDF4', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0', textAlign: 'center' }}>
                  <p style={{ fontSize: '10px', color: '#15803D', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>Alerts Sent</p>
                  <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#16A34A', margin: '2px 0 0' }}>98.8%</p>
                </div>
              </div>

              {/* Sample Compliance Alert Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid #0284C7',
                  border: '1px solid #E2E8F0',
                }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>PB01AB0001 — Insurance Renewal</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>Swayam Kataria • Automated Email Sent</p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284C7', backgroundColor: '#E0F2FE', padding: '2px 8px', borderRadius: '12px' }}>
                    3d left
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid #16A34A',
                  border: '1px solid #E2E8F0',
                }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>CH01CD2201 — PUC Renewal</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>Rishii Dua • SMS + WhatsApp Sent</p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '12px' }}>
                    5d left
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid #CA8A04',
                  border: '1px solid #E2E8F0',
                }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>DL03EF3302 — Road Tax Renewal</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>Ananya Sharma • Email Sent</p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#CA8A04', backgroundColor: '#FEF9C3', padding: '2px 8px', borderRadius: '12px' }}>
                    7d left
                  </span>
                </div>
              </div>

              {/* Call to Action Inside Mock */}
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Link to="/register" className="btn btn-primary w-full" style={{ fontWeight: 800, textAlign: 'center', padding: '12px' }}>
                  Create Free Account
                </Link>
                <Link to="/login" className="btn btn-secondary w-full" style={{ fontWeight: 700, textAlign: 'center', padding: '12px' }}>
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        padding: 'var(--space-16) var(--space-6)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <span style={{
            color: 'var(--color-accent)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            PLATFORM FEATURES
          </span>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 800,
            color: 'var(--color-primary)',
            marginTop: '4px',
          }}>
            Built for Fleet Managers & Transport Operators
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'var(--space-6)',
        }}>
          {features.map((feat, i) => (
            <div key={i} className="card card-elevated" style={{
              padding: 'var(--space-6)',
              borderTop: i % 2 === 0 ? '3px solid var(--color-primary)' : '3px solid var(--color-accent)',
            }}>
              <div style={{ fontSize: '36px', marginBottom: 'var(--space-4)' }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--color-header-top)',
        color: '#FFFFFF',
        padding: 'var(--space-12) var(--space-6) var(--space-6)',
        borderTop: '4px solid var(--color-accent)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <div className="emblem-badge" style={{ width: '36px', height: '36px', fontSize: '18px' }}>A</div>
              <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: '#FFFFFF' }}>AUTORENEW</span>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: '#94A3B8', lineHeight: 1.7 }}>
              Vehicle Compliance Reminder System designed to prevent lapse in Insurance, PUC, and Road Tax coverage.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-accent)', marginBottom: 'var(--space-3)', textTransform: 'uppercase' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-xs)' }}>
              <li><Link to="/login" style={{ color: '#E2E8F0' }}>Sign In</Link></li>
              <li><Link to="/register" style={{ color: '#E2E8F0' }}>Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-accent)', marginBottom: 'var(--space-3)', textTransform: 'uppercase' }}>
              Platform Features
            </h4>
            <p style={{ fontSize: 'var(--font-size-xs)', color: '#E2E8F0', marginBottom: '4px' }}>
              📊 Excel Sheet Auto-Parsing & Validation
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: '#E2E8F0', marginBottom: '4px' }}>
              📡 Multi-Channel Reminders (Email, SMS, WhatsApp)
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: 'var(--space-4)',
          textAlign: 'center',
          fontSize: 'var(--font-size-xs)',
          color: '#94A3B8',
        }}>
          © {new Date().getFullYear()} AutoRenew Vehicle Compliance Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
