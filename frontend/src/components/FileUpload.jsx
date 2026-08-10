import { useState, useRef } from 'react';

export default function FileUpload({ onFileSelect, loading, error, accept = '.xlsx,.xls' }) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (file) {
      const isExcel =
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls') ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';

      if (isExcel) {
        setFileName(file.name);
        onFileSelect(file);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <div>
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{ position: 'relative' }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="spinner spinner-lg"></div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
              Reading Excel sheet and validating records...
            </p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '44px', marginBottom: 'var(--space-3)', color: 'var(--color-primary)' }}>📊</div>
            <h3 style={{
              fontSize: 'var(--font-size-md)',
              color: 'var(--color-primary)',
              fontWeight: 800,
              marginBottom: 'var(--space-2)',
            }}>
              Upload Vehicle Compliance Excel Sheet
            </h3>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text)',
              fontWeight: 600,
              marginBottom: 'var(--space-2)',
            }}>
              {fileName ? fileName : 'Drag and drop your Excel file here'}
            </p>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
            }}>
              or <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>browse files</span>
              <span style={{ margin: '0 var(--space-2)' }}>•</span>
              Supported formats: .xlsx, .xls
              <span style={{ margin: '0 var(--space-2)' }}>•</span>
              Maximum file size: 10 MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginTop: 'var(--space-4)' }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
