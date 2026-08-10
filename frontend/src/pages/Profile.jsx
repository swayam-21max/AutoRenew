import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';

export default function Profile() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [preference, setPreference] = useState(user?.notificationPreference || 'EMAIL');

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileAPI.get();
      const p = res.data.user;
      if (p.fullName) setFullName(p.fullName);
      if (p.phoneNumber) setPhoneNumber(p.phoneNumber);
      if (p.notificationPreference) setPreference(p.notificationPreference);
    } catch (err) {
      console.warn('Failed to load profile data:', err.message);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await profileAPI.update({
        fullName,
        phoneNumber,
        notificationPreference: preference,
      });

      // Update local storage user state
      const token = localStorage.getItem('policypulse_token');
      if (token && res.data.user) {
        localStorage.setItem('policypulse_user', JSON.stringify(res.data.user));
      }

      setSaveStatus({
        type: 'success',
        message: res.data.message || 'Notification preferences saved successfully!',
      });
    } catch (err) {
      setSaveStatus({
        type: 'error',
        message: err.response?.data?.error || 'Failed to update profile settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const initials = (fullName || user?.fullName || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
          <span style={{
            backgroundColor: 'var(--color-accent)',
            color: '#FFFFFF',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 800,
          }}>
            FLEET ACCOUNT HUB
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            • Notification Preferences & Contact Info
          </span>
        </div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-primary)', fontWeight: 800 }}>
          Profile & Notification Settings
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Manage your account contact details and preferred renewal reminder channels.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Profile & Notification Settings Form */}
        <div className="card card-elevated">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--color-primary), #051937)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: 'var(--font-size-xl)',
              fontWeight: 800,
              flexShrink: 0,
              border: '2px solid var(--color-accent)',
            }}>
              {initials}
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)', fontWeight: 800 }}>
                {fullName || user?.fullName || 'User Account'}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                {user?.email}
              </p>
            </div>
          </div>

          {saveStatus && (
            <div className={`alert ${saveStatus.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-4)' }}>
              {saveStatus.message}
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="prof-name">Full Name</label>
              <input
                id="prof-name"
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prof-phone">Phone Number (International Format)</label>
              <input
                id="prof-phone"
                type="tel"
                className="form-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +919876543210"
              />
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Required for SMS & WhatsApp reminders (include country code: e.g., +91, +1)
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prof-pref">Preferred Notification Channel</label>
              <select
                id="prof-pref"
                className="form-input"
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                style={{ fontWeight: 600, color: 'var(--color-primary)' }}
              >
                <option value="EMAIL">📧 Email Only</option>
                <option value="SMS">📱 SMS Only</option>
                <option value="WHATSAPP">💬 WhatsApp Only</option>
                <option value="EMAIL_SMS">📧 + 📱 Email + SMS</option>
                <option value="EMAIL_WHATSAPP">📧 + 💬 Email + WhatsApp</option>
                <option value="ALL">🔔 All Channels (Email + SMS + WhatsApp)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-accent w-full"
              disabled={saving}
              style={{ fontWeight: 800, marginTop: 'var(--space-2)', padding: '12px' }}
            >
              {saving ? 'Saving Settings...' : '💾 Save Notification Settings'}
            </button>
          </form>
        </div>

        {/* Automated Engine System Info Card */}
        <div className="card card-elevated" style={{ borderTop: '4px solid var(--color-primary)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border-light)',
          }}>
            <span style={{ fontSize: '28px' }}>🤖</span>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--color-primary)' }}>
                Automated System Status
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Zero-maintenance compliance engine active
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ padding: 'var(--space-3)', backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)', border: '1px solid #BAE6FD' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: '#0369A1', margin: 0 }}>⏰ Automated Daily Sweep</p>
              <p style={{ fontSize: '11px', color: '#0284C7', margin: '2px 0 0' }}>Runs automatically every day at 09:00 AM IST.</p>
            </div>

            <div style={{ padding: 'var(--space-3)', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: '#15803D', margin: 0 }}>⚡ Excel Auto-Trigger</p>
              <p style={{ fontSize: '11px', color: '#16A34A', margin: '2px 0 0' }}>Dispatches due reminders instantly upon Excel import.</p>
            </div>

            <div style={{ padding: 'var(--space-3)', backgroundColor: '#FEFCE8', borderRadius: 'var(--radius-md)', border: '1px solid #FEF08A' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: '#A16207', margin: 0 }}>🔒 Guaranteed Zero Duplicates</p>
              <p style={{ fontSize: '11px', color: '#CA8A04', margin: '2px 0 0' }}>Database logs prevent sending duplicate milestone alerts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
