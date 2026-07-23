import useImportSection from '../hooks/useImportSection';

/** Thin UI for the CSV bulk-import flow — logic lives in `useImportSection`. */
const ImportSection = () => {
  const {
    fileName,
    isPending,
    serverError,
    result,
    onFileChange,
    onImport,
    onDownloadCredentials,
  } = useImportSection();

  return (
    <section className="admin-section">
      <h2 className="admin-section__title">Bulk import (CSV)</h2>

      <p className="admin-note">
        Upload a CSV with the header <code>name,email,role,classGroup</code>. Each imported
        user gets a generated temporary password — download the credentials afterwards to
        share them, they are shown only once.
      </p>

      <div className="admin-import">
        <input type="file" accept=".csv,text/csv" onChange={onFileChange} disabled={isPending} />
        <button
          type="button"
          className="admin-button admin-button--primary"
          onClick={onImport}
          disabled={isPending || !fileName}
        >
          {isPending ? 'Importing…' : 'Import'}
        </button>
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
