import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, reminderAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [emailStats, setEmailStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'INSURANCE', 'PUC', 'ROAD_TAX'

  // Admin action state
  const [triggering, setTriggering] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [actionStatus, setActionStatus] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [dashRes, remStatsRes] = await Promise.all([
        dashboardAPI.getStats(),
        reminderAPI.getStats().catch(() => ({ data: { stats: null } })),
      ]);
      setData(dashRes.data);
      if (remStatsRes.data?.stats) {
        setEmailStats(remStatsRes.data.stats);
      }
    } catch (err) {
      setError('Failed to load vehicle compliance dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunEngineNow = async () => {
    setTriggering(true);
    setActionStatus(null);
    try {
      const res = await reminderAPI.triggerEngine();
      setActionStatus({
        type: 'success',
        message: res.data.message,
      });
      fetchDashboardStats();
    } catch (err) {
      setActionStatus({
        type: 'error',
        message: err.response?.data?.error || 'Failed to trigger reminder engine.',
      });
    } finally {
      setTriggering(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestingEmail(true);
    setActionStatus(null);
    try {
      const res = await reminderAPI.sendTestEmail();
      setActionStatus({
        type: 'success',
        message: res.data.message,
        previewUrl: res.data.previewUrl,
      });
      fetchDashboardStats();
    } catch (err) {
      setActionStatus({
        type: 'error',
        message: err.response?.data?.error || 'Failed to send test email.',
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading Fleet Compliance Overview..." />;
  if (error) return <div className="alert alert-error">{error}</div>;

  const notifStats = data.notificationStats || { emailsSent: 0, successRate: 100 };
  const emStats = emailStats || { totalEmailsSent: notifStats.emailsSent || 0, emailsSentToday: 0 };
  
  const totalExpiringSoon = 
    (data.stats.insuranceExpiringSoon || 0) + 
    (data.stats.pucExpiringSoon || 0) + 
    (data.stats.roadTaxExpiringSoon || 0);

  // Combine and format upcoming expiries for tabbed list view
  const allUpcoming = [];
  (data.upcoming?.insurance || []).forEach(v => {
    allUpcoming.push({ ...v, itemType: 'INSURANCE', title: 'Insurance', days: v.compliance.insuranceDays, expiry: v.insurance_expiry });
  });
  (data.upcoming?.puc || []).forEach(v => {
    allUpcoming.push({ ...v, itemType: 'PUC', title: 'PUC Certificate', days: v.compliance.pucDays, expiry: v.puc_expiry });
  });
  (data.upcoming?.roadTax || []).forEach(v => {
    allUpcoming.push({ ...v, itemType: 'ROAD_TAX', title: 'Road Tax', days: v.compliance.roadTaxDays, expiry: v.road_tax_expiry });
  });

  allUpcoming.sort((a, b) => a.days - b.days);

  const filteredUpcoming = activeTab === 'ALL'
    ? allUpcoming
    : allUpcoming.filter(v => v.itemType === activeTab);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-10)' }}>
      {/* Clean Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
      }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-primary)', fontWeight: 800 }}>
            Vehicle Compliance Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
            Automated Insurance, PUC, and Road Tax Renewal Management
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleSendTestEmail}
            disabled={testingEmail}
            style={{ fontWeight: 700 }}
          >
            {testingEmail ? 'Sending...' : '✉️ Send Test Email'}
          </button>
          <button
            className="btn btn-accent btn-sm"
            onClick={handleRunEngineNow}
            disabled={triggering}
            style={{ fontWeight: 800 }}
          >
            {triggering ? 'Scanning...' : '⚡ Run Reminder Engine'}
          </button>
        </div>
      </div>

      {actionStatus && (
        <div className={`alert ${actionStatus.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-6)' }}>
          <div>{actionStatus.message}</div>
          {actionStatus.previewUrl && (
            <a href={actionStatus.previewUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 800, color: 'var(--color-primary)', textDecoration: 'underline', marginLeft: '12px' }}>
              View Rendered Preview →
            </a>
          )}
        </div>
      )}

      {/* Single Unified 4-Metric Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-5)',
        marginBottom: 'var(--space-8)',
      }}>
        <div className="card card-elevated" style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Vehicles</p>
            <span style={{ fontSize: '20px' }}>🚛</span>
          </div>
          <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)', margin: '6px 0 0' }}>
            {data.stats.totalVehicles}
          </p>
        </div>

        <div className="card card-elevated" style={{ padding: 'var(--space-5)', borderLeft: '4px solid #D97706' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: '#A16207', fontWeight: 700, textTransform: 'uppercase' }}>Expiring Soon</p>
            <span style={{ fontSize: '20px' }}>⏰</span>
          </div>
          <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#D97706', margin: '6px 0 0' }}>
            {totalExpiringSoon}
          </p>
        </div>

        <div className="card card-elevated" style={{ padding: 'var(--space-5)', borderLeft: '4px solid #0284C7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: '#0369A1', fontWeight: 700, textTransform: 'uppercase' }}>Emails Dispatched</p>
            <span style={{ fontSize: '20px' }}>📧</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#0284C7', margin: 0 }}>
              {emStats.totalEmailsSent}
            </p>
            {emStats.emailsSentToday > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A' }}>
                ({emStats.emailsSentToday} today)
              </span>
            )}
          </div>
        </div>

        <div className="card card-elevated" style={{ padding: 'var(--space-5)', borderLeft: '4px solid #16A34A' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: '#15803D', fontWeight: 700, textTransform: 'uppercase' }}>Delivery Success</p>
            <span style={{ fontSize: '20px' }}>🎯</span>
          </div>
          <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#16A34A', margin: '6px 0 0' }}>
            {notifStats.successRate}%
          </p>
        </div>
      </div>

      {/* Spacious Fleet Expiry Renewals Card */}
      <div className="card card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Card Header & Filter Tabs */}
        <div style={{
          padding: 'var(--space-5) var(--space-6)',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--color-primary)' }}>
              Upcoming Fleet Renewal Deadlines
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
              Auto-monitored exipries sorted by nearest due date
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: 'All Expiries' },
              { id: 'INSURANCE', label: '🛡️ Insurance' },
              { id: 'PUC', label: '🌿 PUC' },
              { id: 'ROAD_TAX', label: '🛣️ Road Tax' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : '#FFFFFF',
                  color: activeTab === tab.id ? '#FFFFFF' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spacious Table View */}
        {filteredUpcoming.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>✨</p>
            <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>All vehicle compliance items are up to date!</p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>No upcoming expiries found for this filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Owner Name</th>
                  <th>Compliance Item</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpcoming.map((item, idx) => {
                  const badgeColor = 
                    item.days <= 3 ? '#DC2626' : 
                    item.days <= 15 ? '#D97706' : '#0284C7';

                  const badgeBg = 
                    item.days <= 3 ? '#FEF2F2' : 
                    item.days <= 15 ? '#FEFCE8' : '#F0F9FF';

                  return (
                    <tr key={`${item.id}-${item.itemType}-${idx}`}>
                      <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                        {item.vehicle_number}
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                        {item.owner_name}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          backgroundColor: 
                            item.itemType === 'INSURANCE' ? '#E0F2FE' : 
                            item.itemType === 'PUC' ? '#DCFCE7' : '#FEF9C3',
                          color: 
                            item.itemType === 'INSURANCE' ? '#0369A1' : 
                            item.itemType === 'PUC' ? '#15803D' : '#A16207',
                        }}>
                          {item.title}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        {formatDate(item.expiry)}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: badgeColor,
                          backgroundColor: badgeBg,
                          padding: '3px 10px',
                          borderRadius: '12px',
                        }}>
                          {item.days <= 0 ? 'Expired' : `${item.days} day(s) left`}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/vehicles/${item.id}`}
                          className="btn btn-ghost btn-sm"
                          style={{ fontWeight: 700, color: 'var(--color-primary)' }}
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
