import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../services/api';
import FileUpload from '../components/FileUpload';

export default function VehicleUpload() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [downloadingSample, setDownloadingSample] = useState(false);
  const [error, setError] = useState('');
  const [importSummary, setImportSummary] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleFileSelect = async (file) => {
    setUploading(true);
    setError('');
    setImportSummary(null);
    setValidationErrors([]);

    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      const res = await vehicleAPI.importExcel(formData);
      setImportSummary(res.data.summary);
      if (res.data.validationErrors) {
        setValidationErrors(res.data.validationErrors);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to process Excel file. Please ensure it follows the required format.'
      );
      if (err.response?.data?.summary) setImportSummary(err.response.data.summary);
      if (err.response?.data?.validationErrors) setValidationErrors(err.response.data.validationErrors);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSample = async () => {
    setDownloadingSample(true);
    try {
      const res = await vehicleAPI.downloadSample();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Vehicle_Compliance_Sample_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download sample template.');
    } finally {
      setDownloadingSample(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
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
            EXCEL DATA IMPORT ENGINE
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            • Bulk Fleet Compliance Import (.xlsx, .xls)
          </span>
        </div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-primary)', fontWeight: 800 }}>
          Upload Vehicle Compliance Excel Sheet
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Import your fleet compliance data to automate Insurance, PUC, and Road Tax renewal notifications.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Upload Card */}
        <div className="card card-elevated">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
            paddingBottom: 'var(--space-3)',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--color-primary)' }}>
              📥 Bulk Excel Import
            </h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleDownloadSample}
              disabled={downloadingSample}
              style={{ fontWeight: 700, color: 'var(--color-primary)' }}
            >
              {downloadingSample ? 'Downloading...' : '📄 Download Sample Template'}
            </button>
          </div>

          <FileUpload
            onFileSelect={handleFileSelect}
            loading={uploading}
            error={error}
            accept=".xlsx,.xls"
          />

          <div style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}>
            <h4 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
              Expected Excel Columns:
            </h4>
            <ul style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
              <li><strong>Owner Name</strong> (Required)</li>
              <li><strong>Phone Number</strong> (Required — e.g. +919463553271)</li>
              <li><strong>Vehicle Number</strong> (Required — e.g. PB01AB0001)</li>
              <li><strong>Email</strong> (Optional)</li>
              <li><strong>Insurance Expiry Date</strong> (e.g. 2026-08-15 or 15-08-2026)</li>
              <li><strong>PUC Expiry Date</strong> (e.g. 2026-12-30)</li>
              <li><strong>Road Tax Expiry Date</strong> (e.g. 2030-01-01)</li>
            </ul>
          </div>
        </div>

        {/* Import Summary & Report Card */}
        {importSummary && (
          <div className="card card-elevated card-accent animate-slide-up">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)',
              paddingBottom: 'var(--space-3)',
              borderBottom: '2px solid var(--color-primary-light)',
            }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--color-primary)' }}>
                📊 Import Summary Report
              </h3>
              <button
                className="btn btn-accent btn-sm"
                onClick={() => navigate('/vehicles')}
                style={{ fontWeight: 700 }}
              >
                View Fleet Vehicles →
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
            }}>
              <div style={{ backgroundColor: '#F0FDF4', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
                <p style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Imported / Updated</p>
                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#16A34A', margin: 0 }}>{importSummary.imported || importSummary.validRows}</p>
              </div>

              <div style={{ backgroundColor: '#FEF2F2', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA' }}>
                <p style={{ fontSize: '11px', color: '#991B1B', fontWeight: 700, textTransform: 'uppercase' }}>Failed / Skipped</p>
                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#DC2626', margin: 0 }}>{importSummary.failedRows}</p>
              </div>
            </div>

            {/* Auto Reminder Engine Dispatch Notification */}
            <div style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: '#F0F9FF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #BAE6FD',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              <span style={{ fontSize: '18px' }}>⚡</span>
              <div>
                <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: '#0369A1', margin: 0 }}>
                  Automated Reminder Engine Triggered
                </p>
                <p style={{ fontSize: '11px', color: '#0284C7', margin: 0 }}>
                  Dispatched {importSummary.remindersDispatched || 0} automated renewal email(s) to vehicle owners for upcoming expiries.
                </p>
              </div>
            </div>

            {/* Validation Errors Table if any */}
            {validationErrors.length > 0 && (
              <div>
                <h4 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
                  ⚠ Row Validation Issues ({validationErrors.length})
                </h4>
                <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <table style={{ fontSize: '11px' }}>
                    <thead>
                      <tr>
                        <th>Row</th>
                        <th>Vehicle #</th>
                        <th>Issue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationErrors.map((err, i) => (
                        <tr key={i}>
                          <td>Row {err.rowNumber}</td>
                          <td style={{ fontWeight: 700 }}>{err.vehicleNumber}</td>
                          <td style={{ color: '#DC2626' }}>{err.errors.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
