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
    <div className="table-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Status</th>
            <th>Submitted at</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.studentId}>
              <td>{row.studentName}</td>
              <td>
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
              <td>
                {row.submission
                  ? new Date(row.submission.submittedAt).toLocaleString()
                  : '—'}
              </td>
              <td>
                {row.submission && (
                  <button
                    type="button"
                    className="btn btn--sm btn--ghost"
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
