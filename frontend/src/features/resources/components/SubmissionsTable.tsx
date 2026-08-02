import type { SubmissionStatusDto } from '../types';

interface SubmissionsTableProps {
  rows: SubmissionStatusDto[];
  onDownload: (submissionId: number, filename: string) => void;
}

const statusLabel: Record<SubmissionStatusDto['status'], string> = {
  SUBMITTED: 'Submitted',
  LATE_SUBMITTED: 'Late',
  MISSING: 'Missing',
};

const SubmissionsTable = ({ rows, onDownload }: SubmissionsTableProps) => {
  if (rows.length === 0) {
    return <p className="res-resource__meta">No submissions yet.</p>;
  }

  return (
    <div className="res-submissions-table">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>Student</th>
            <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>Status</th>
            <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>Submitted at</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.studentId}>
              <td style={{ padding: '0.35rem 0.5rem' }}>{row.studentName}</td>
              <td style={{ padding: '0.35rem 0.5rem' }}>
                <span
                  className={`res-badge${
                    row.status === 'SUBMITTED'
                      ? ' res-badge--submitted'
                      : row.status === 'LATE_SUBMITTED'
                        ? ' res-badge--late'
                        : ' res-badge--missing'
                  }`}
                >
                  {statusLabel[row.status]}
                </span>
              </td>
              <td style={{ padding: '0.35rem 0.5rem' }}>
                {row.submission
                  ? new Date(row.submission.submittedAt).toLocaleString()
                  : '—'}
              </td>
              <td style={{ padding: '0.35rem 0.5rem' }}>
                {row.submission && (
                  <button
                    type="button"
                    className="res-btn res-btn--sm res-btn--ghost"
                    onClick={() =>
                      onDownload(row.submission!.id, row.submission!.originalName)
                    }
                  >
                    Download
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionsTable;
