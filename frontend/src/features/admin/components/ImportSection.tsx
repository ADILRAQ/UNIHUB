import useImportSection from '../hooks/useImportSection';

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

/** Thin UI for the CSV bulk-import flow — logic lives in `useImportSection`. */
const ImportSection = () => {
  const {
    inputRef,
    status,
    fileName,
    fileSize,
    fileError,
    isPending,
    serverError,
    result,
    onFileChange,
    onDragOver,
    onDragLeave,
    onDrop,
    onBrowse,
    onRemove,
    onImport,
    onDownloadTemplate,
    onDownloadCredentials,
  } = useImportSection();

  const hasFile = status === 'selected' || status === 'error';

  return (
    <section className="admin-section admin-import-section">
      <h2 className="admin-section__title">Bulk import (CSV)</h2>

      <p className="admin-note admin-import__intro">
        Upload a CSV with the header <code className="admin-code">name,email,role,classGroup</code>.
        Each imported user gets a generated temporary password — download the credentials
        afterwards to share them, they are shown only once.
      </p>

      <div className="admin-import__template">
        <button type="button" className="admin-link-button" onClick={onDownloadTemplate}>
          <svg width="14" height="14" strokeWidth="2" {...svgProps}>
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
          Download CSV template
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={onFileChange}
        disabled={isPending}
        hidden
      />

      <div
        className={`dropzone dropzone--${status}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {!hasFile && (
          <>
            <div className="dropzone__icon">
              <svg width="24" height="24" strokeWidth="1.8" {...svgProps}>
                <path d="M7 18a4 4 0 0 1-1-7.9A5 5 0 0 1 16 8a4.5 4.5 0 0 1 1 8.9" />
                <path d="M12 12v7" />
                <path d="M9 15l3-3 3 3" />
              </svg>
            </div>
            <div className="dropzone__title">
              {status === 'dragging' ? 'Drop your CSV file here' : 'Drag and drop your CSV file here'}
            </div>
            <div className="dropzone__or">
              <span>or</span>
              <button
                type="button"
                className="dropzone__browse"
                onClick={onBrowse}
                disabled={isPending}
              >
                Browse files
              </button>
            </div>
            <div className="dropzone__hint">CSV only · up to 5 MB</div>
          </>
        )}

        {hasFile && (
          <div className="dropzone__file">
            <div className={`dropzone__file-icon dropzone__file-icon--${status}`}>
              {status === 'selected' ? (
                <svg width="20" height="20" strokeWidth="1.8" {...svgProps}>
                  <path d="M6 2h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
                  <path d="M14 2v5h5" />
                </svg>
              ) : (
                <svg width="20" height="20" strokeWidth="1.8" {...svgProps}>
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="M10.3 3.9 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                </svg>
              )}
            </div>
            <div className="dropzone__file-info">
              <div className="dropzone__file-name">{fileName}</div>
              <div
                className={`dropzone__file-meta dropzone__file-meta--${status}`}
                role={status === 'error' ? 'alert' : undefined}
              >
                {status === 'selected' ? (
                  <>
                    <svg width="13" height="13" strokeWidth="2.4" {...svgProps}>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Ready to import · {fileSize}
                  </>
                ) : (
                  fileError
                )}
              </div>
            </div>
            <button
              type="button"
              aria-label="Remove file"
              className="dropzone__remove"
              onClick={onRemove}
              disabled={isPending}
            >
              <svg width="16" height="16" strokeWidth="2" {...svgProps}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="admin-import">
        <button
          type="button"
          className="admin-button admin-button--primary admin-import__submit"
          onClick={onImport}
          disabled={isPending || status !== 'selected'}
        >
          {isPending ? 'Importing…' : 'Import'}
        </button>
        {status !== 'selected' && (
          <span className="admin-import__hint">Choose a CSV file to enable import</span>
        )}
      </div>

      {serverError && <p className="admin-error">{serverError}</p>}

      {result && (
        <div className="admin-import__result">
          <p className="admin-import__summary">
            <span className="admin-badge admin-badge--active">{result.successCount} created</span>
            <span className="admin-badge admin-badge--inactive">{result.errorCount} failed</span>
          </p>

          {result.createdUsers.length > 0 && (
            <button type="button" className="admin-button" onClick={onDownloadCredentials}>
              Download credentials
            </button>
          )}

          {result.errors.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>Email</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((error) => (
                    <tr key={`${error.line}-${error.email}`}>
                      <td>{error.line}</td>
                      <td>{error.email}</td>
                      <td>{error.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ImportSection;
