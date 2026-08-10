import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vehicleAPI } from '../services/api';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    phoneNumber: '',
    vehicleNumber: '',
    insuranceExpiry: '',
    pucExpiry: '',
    roadTaxExpiry: '',
  });
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, [page, search, filter]);

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await vehicleAPI.getAll({
        page,
        limit: 10,
        search,
        filter,
      });
      setVehicles(res.data.vehicles);
      setPagination(res.data.pagination);
    } catch (err) {
      setError('Failed to fetch vehicle fleet records.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      ownerName: '',
      email: '',
      phoneNumber: '',
      vehicleNumber: '',
      insuranceExpiry: '',
      pucExpiry: '',
      roadTaxExpiry: '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (vehicle) => {
    setFormData({
      ownerName: vehicle.owner_name || '',
      email: vehicle.email || '',
      phoneNumber: vehicle.phone_number || '',
      vehicleNumber: vehicle.vehicle_number || '',
      insuranceExpiry: vehicle.insurance_expiry ? vehicle.insurance_expiry.substring(0, 10) : '',
      pucExpiry: vehicle.puc_expiry ? vehicle.puc_expiry.substring(0, 10) : '',
      roadTaxExpiry: vehicle.road_tax_expiry ? vehicle.road_tax_expiry.substring(0, 10) : '',
    });
    setFormError('');
    setEditingVehicle(vehicle);
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    setFormError('');

    try {
      if (editingVehicle) {
        await vehicleAPI.update(editingVehicle.id, formData);
        setEditingVehicle(null);
      } else {
        await vehicleAPI.create(formData);
        setIsAddModalOpen(false);
      }
      fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save vehicle record.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deletingVehicle) return;
    try {
      await vehicleAPI.delete(deletingVehicle.id);
      setDeletingVehicle(null);
      fetchVehicles();
    } catch (err) {
      alert('Failed to delete vehicle record.');
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

  const renderComplianceBadge = (comp) => {
    if (!comp || !comp.highestPriority) {
      return (
        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#475569' }}>
          Active (No Expiries)
        </span>
      );
    }

    const { highestPriority, status } = comp;
    let bg = '#FEF3C7';
    let fg = '#D97706';

    if (status === 'EXPIRED') {
      bg = '#FEE2E2';
      fg = '#DC2626';
    } else if (status === 'EXPIRING_SOON') {
      bg = '#FFEDD5';
      fg = '#C2410C';
    } else {
      bg = '#DCFCE7';
      fg = '#15803D';
    }

    return (
      <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 9px', borderRadius: '12px', backgroundColor: bg, color: fg, border: '1px solid currentColor' }}>
        {highestPriority.label}: {highestPriority.days <= 0 ? 'EXPIRED' : `${highestPriority.days}d remaining`}
      </span>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-primary)', fontWeight: 800 }}>
            Vehicle Fleet & Compliance
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Manage your transport fleet vehicles, track Insurance, PUC, and Road Tax renewals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link to="/import" className="btn btn-secondary">
            📥 Bulk Excel Import
          </Link>
          <button className="btn btn-accent" onClick={handleOpenAdd} style={{ fontWeight: 700 }}>
            ⚡ + Add Vehicle
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card card-elevated" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <SearchBar
              value={search}
              onChange={(val) => { setSearch(val); setPage(1); }}
              placeholder="Search vehicle #, owner name, phone..."
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto' }}>
            {[
              { label: 'All Fleet', value: '' },
              { label: '⚠️ Insurance Due', value: 'insurance_due' },
              { label: '⚡ PUC Due', value: 'puc_due' },
              { label: '📋 Road Tax Due', value: 'road_tax_due' },
              { label: '🚨 Expired', value: 'expired' },
              { label: '✅ Active', value: 'active' },
            ].map((tab) => (
              <button
                key={tab.value}
                className={`btn btn-sm ${filter === tab.value ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => { setFilter(tab.value); setPage(1); }}
                style={{ fontWeight: 700, whitespace: 'nowrap' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="card card-elevated" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <LoadingSpinner size="lg" text="Fetching fleet records..." />
        ) : error ? (
          <div className="alert alert-error" style={{ margin: 'var(--space-4)' }}>{error}</div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon="🚛"
            title="No vehicles found"
            description={search || filter ? 'No vehicle records match your search query or filter.' : 'Start by importing an Excel sheet or adding your first vehicle manually.'}
            action={
              <Link to="/import" className="btn btn-accent btn-sm" style={{ fontWeight: 700 }}>
                Bulk Excel Import
              </Link>
            }
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Owner Name</th>
                  <th className="hide-mobile">Phone Number</th>
                  <th>Insurance Expiry</th>
                  <th>PUC Expiry</th>
                  <th className="hide-mobile">Road Tax Expiry</th>
                  <th>Compliance Priority</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link to={`/vehicles/${v.id}`} style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                        {v.vehicle_number}
                      </Link>
                    </td>
                    <td style={{ fontWeight: 600 }}>{v.owner_name}</td>
                    <td className="hide-mobile">{v.phone_number}</td>
                    <td style={{ fontWeight: 500 }}>{formatDate(v.insurance_expiry)}</td>
                    <td style={{ fontWeight: 500 }}>{formatDate(v.puc_expiry)}</td>
                    <td className="hide-mobile" style={{ fontWeight: 500 }}>{formatDate(v.road_tax_expiry)}</td>
                    <td>{renderComplianceBadge(v.compliance)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleOpenEdit(v)}
                          title="Edit Vehicle"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeletingVehicle(v)}
                          title="Delete Vehicle"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div style={{ padding: 'var(--space-4)' }}>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Vehicle Modal */}
      {(isAddModalOpen || editingVehicle) && (
        <Modal
          isOpen={Boolean(isAddModalOpen || editingVehicle)}
          onClose={() => { setIsAddModalOpen(false); setEditingVehicle(null); }}
          title={editingVehicle ? `Edit Vehicle — ${editingVehicle.vehicle_number}` : '⚡ Add New Vehicle'}
        >
          {formError && <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>{formError}</div>}

          <form onSubmit={handleSaveVehicle} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Vehicle Number *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  placeholder="e.g. PB01AB0001"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Owner Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="e.g. Swayam Kataria"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="e.g. +919463553271"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email (Optional)</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. owner@example.com"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label className="form-label">Insurance Expiry</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.insuranceExpiry}
                  onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">PUC Expiry</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.pucExpiry}
                  onChange={(e) => setFormData({ ...formData, pucExpiry: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Road Tax Expiry</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.roadTaxExpiry}
                  onChange={(e) => setFormData({ ...formData, roadTaxExpiry: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setIsAddModalOpen(false); setEditingVehicle(null); }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-accent"
                disabled={formSaving}
                style={{ fontWeight: 800 }}
              >
                {formSaving ? 'Saving...' : editingVehicle ? 'Save Changes' : 'Add Vehicle'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingVehicle && (
        <Modal
          isOpen={Boolean(deletingVehicle)}
          onClose={() => setDeletingVehicle(null)}
          title="Confirm Vehicle Deletion"
        >
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
            Are you sure you want to delete vehicle <strong>{deletingVehicle.vehicle_number}</strong> (Owner: {deletingVehicle.owner_name})? This action cannot be undone.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <button className="btn btn-secondary" onClick={() => setDeletingVehicle(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteVehicle} style={{ fontWeight: 800 }}>
              Delete Vehicle
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
