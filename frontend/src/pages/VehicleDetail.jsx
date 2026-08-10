import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicleDetail();
  }, [id]);

  const fetchVehicleDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await vehicleAPI.getById(id);
      setVehicle(res.data.vehicle);
    } catch (err) {
      setError('Failed to load vehicle compliance details.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not Configured';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading vehicle compliance details..." />;

  if (error || !vehicle) {
    return (
      <div className="alert alert-error" style={{ margin: 'var(--space-6)' }}>
        {error || 'Vehicle not found.'}
      </div>
    );
  }

  const { compliance } = vehicle;

  return (
    <div className="animate-fade-in">
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/vehicles')}>
            ← Back to Fleet
          </button>
          <div>
            <span style={{
              backgroundColor: 'var(--color-accent)',
              color: '#FFFFFF',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 800,
            }}>
              VEHICLE COMPLIANCE DOSSIER
            </span>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-primary)', fontWeight: 800, marginTop: '2px' }}>
              {vehicle.vehicle_number}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={async () => {
              if (confirm(`Are you sure you want to delete vehicle ${vehicle.vehicle_number}?`)) {
                await vehicleAPI.delete(vehicle.id);
                navigate('/vehicles');
              }
            }}
          >
            🗑️ Delete Record
          </button>
        </div>
      </div>

      {/* Main Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* Owner Details Card */}
        <div className="card card-elevated">
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
            👤 Vehicle Owner Info
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Owner Name</p>
              <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>{vehicle.owner_name}</p>
            </div>

            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Phone Number</p>
              <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{vehicle.phone_number}</p>
            </div>

            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>{vehicle.email || 'None provided'}</p>
            </div>
          </div>
        </div>

        {/* Highest Priority Alert */}
        <div className="card card-elevated card-accent">
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
            🚨 Highest Priority Compliance
          </h3>

          {compliance && compliance.highestPriority ? (
            <div>
              <div style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: compliance.status === 'EXPIRED' ? '#FEF2F2' : '#FFFBEB',
                border: compliance.status === 'EXPIRED' ? '1px solid #FECACA' : '1px solid #FDE68A',
                marginBottom: 'var(--space-4)',
              }}>
                <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: compliance.status === 'EXPIRED' ? '#DC2626' : '#D97706', textTransform: 'uppercase' }}>
                  {compliance.highestPriority.label}
                </p>
                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-primary)', margin: '4px 0' }}>
                  {compliance.highestPriority.days <= 0 ? 'EXPIRED!' : `${compliance.highestPriority.days} Days Remaining`}
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                  Expiry Date: {formatDate(compliance.highestPriority.date)}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              All compliance items are active and up to date.
            </p>
          )}
        </div>
      </div>

      {/* Compliance Expiry Breakdown Grid */}
      <h2 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
        📋 Compliance Item Expiries
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Insurance */}
        <div className="card card-elevated" style={{ borderLeft: '5px solid #0284C7' }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
            🛡️ Insurance Renewal
          </h4>
          <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 4px' }}>
            {formatDate(vehicle.insurance_expiry)}
          </p>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
            {compliance.insuranceDays !== null ? `${compliance.insuranceDays} days left` : 'No expiry set'}
          </span>
        </div>

        {/* PUC */}
        <div className="card card-elevated" style={{ borderLeft: '5px solid #16A34A' }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
            🌿 Pollution Certificate (PUC)
          </h4>
          <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 4px' }}>
            {formatDate(vehicle.puc_expiry)}
          </p>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
            {compliance.pucDays !== null ? `${compliance.pucDays} days left` : 'No expiry set'}
          </span>
        </div>

        {/* Road Tax */}
        <div className="card card-elevated" style={{ borderLeft: '5px solid #CA8A04' }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: '#CA8A04', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
            🛣️ Road Tax Renewal
          </h4>
          <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 4px' }}>
            {formatDate(vehicle.road_tax_expiry)}
          </p>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
            {compliance.roadTaxDays !== null ? `${compliance.roadTaxDays} days left` : 'No expiry set'}
          </span>
        </div>
      </div>
    </div>
  );
}
