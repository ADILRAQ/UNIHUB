import { useRef, useState } from 'react';
import type { AssignmentDto, SubmissionDto, SubmissionStatusDto } from '../types';
import SubmissionsTable from './SubmissionsTable';

interface AssignmentItemProps {
  assignment: AssignmentDto;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isExpanded: boolean;
  submissions: SubmissionStatusDto[] | undefined;
  isSubmitting: boolean;
  mySubmission: SubmissionDto | null | undefined;
  onToggleSubmissions: (id: number) => void;
  onSubmit: (assignmentId: number, file: File) => void;
  onDelete: (id: number) => void;
  onDownloadSubmission: (submissionId: number, filename: string) => void;
  onFetchMySubmission: (assignmentId: number) => void;
}

const statusClass = (
  status: AssignmentDto['mySubmissionStatus'],
): string => {
  if (status === 'SUBMITTED') return 'res-badge--submitted';
  if (status === 'LATE_SUBMITTED') return 'res-badge--late';
  if (status === 'MISSING') return 'res-badge--missing';
  return '';
};

const statusLabel = (status: AssignmentDto['mySubmissionStatus']): string => {
  if (status === 'SUBMITTED') return 'Submitted';
  if (status === 'LATE_SUBMITTED') return 'Late';
  if (status === 'MISSING') return 'Missing';
  return 'Not submitted';
};

const AssignmentItem = ({
  assignment,
  role,
  isExpanded,
  submissions,
  isSubmitting,
  mySubmission,
  onToggleSubmissions,
  onSubmit,
  onDelete,
  onDownloadSubmission,
  onFetchMySubmission,
}: AssignmentItemProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resubmitInputRef = useRef<HTMLInputElement>(null);
  const isStudent = role === 'STUDENT';
  const isTeacherOrAdmin = role === 'TEACHER' || role === 'ADMIN';
  const dueDate = new Date(assignment.dueAt);
  const isPast = dueDate < new Date();
  const [showMySubmission, setShowMySubmission] = useState(false);

  const canUpload =
    isStudent &&
    (assignment.mySubmissionStatus == null ||
      assignment.mySubmissionStatus === 'MISSING' ||
      assignment.mySubmissionStatus === 'LATE_SUBMITTED');

  const isSubmitted = assignment.mySubmissionStatus === 'SUBMITTED';

  const handleViewSubmission = () => {
    if (!showMySubmission) {
      onFetchMySubmission(assignment.id);
    }
    setShowMySubmission((v) => !v);
  };

  return (
    <div className="res-assignment">
      <div className="res-assignment__header">
        <strong>{assignment.title}</strong>
        {isStudent && (
          <span
            className={`res-badge ${statusClass(assignment.mySubmissionStatus)}`}
          >
            {statusLabel(assignment.mySubmissionStatus)}
          </span>
        )}
        {isTeacherOrAdmin && (
          <span style={{ display: 'flex', gap: 'var(--space-1)', marginLeft: 'auto' }}>
            <button
              type="button"
              className="res-btn res-btn--sm res-btn--ghost"
              onClick={() => onToggleSubmissions(assignment.id)}
            >
              {isExpanded ? 'Hide submissions' : 'View submissions'}
            </button>
            <button
              type="button"
              className="res-btn res-btn--sm res-btn--danger"
              onClick={() => {
                if (window.confirm(`Delete assignment "${assignment.title}"?`)) {
                  onDelete(assignment.id);
                }
              }}
            >
              Delete
            </button>
          </span>
        )}
      </div>

      <p className="res-assignment__meta">
        Due:{' '}
        <span style={{ color: isPast ? 'var(--color-danger-dark)' : 'inherit' }}>
          {dueDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
        {isPast && <span style={{ marginLeft: 'var(--space-1)', color: 'var(--color-danger-dark)' }}>Overdue</span>}
      </p>

      {assignment.description && (
        <p className="res-assignment__meta">{assignment.description}</p>
      )}

      {/* Student: upload button for MISSING/LATE_SUBMITTED */}
      {canUpload && (
        <span style={{ display: 'inline-block', marginTop: 'var(--space-2)' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSubmit(assignment.id, file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="res-btn res-btn--sm res-btn--primary"
            disabled={isSubmitting}
            onClick={() => fileInputRef.current?.click()}
          >
            {isSubmitting ? 'Submitting…' : assignment.mySubmissionStatus === 'LATE_SUBMITTED'
              ? 'Re-submit'
              : 'Submit assignment'}
          </button>
        </span>
      )}

      {/* Student: view/resubmit for SUBMITTED */}
      {isStudent && isSubmitted && (
        <span style={{ display: 'inline-flex', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
          <button
            type="button"
            className="res-btn res-btn--sm res-btn--ghost"
            onClick={handleViewSubmission}
          >
            {showMySubmission ? 'Hide submission' : 'View submission'}
          </button>
        </span>
      )}

      {/* My submission detail panel */}
      {isStudent && isSubmitted && showMySubmission && (
        <div
          style={{
            marginTop: 'var(--space-2)',
            background: '#F8F7FF',
            border: '1px solid #E1DEF2',
            borderRadius: 10,
            padding: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          {mySubmission === undefined && (
            <p className="res-resource__meta">Loading…</p>
          )}
          {mySubmission === null && (
            <p className="res-resource__meta">Could not load submission details.</p>
          )}
          {mySubmission && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#6B6B7B', letterSpacing: '0.06em' }}>FILE</span>
                <span style={{ fontSize: 13.5, color: '#1F1B33', fontWeight: 600 }}>{mySubmission.originalName}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#6B6B7B', letterSpacing: '0.06em' }}>SUBMITTED AT</span>
                <span style={{ fontSize: 13.5, color: '#45435A' }}>
                  {new Date(mySubmission.submittedAt).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                  {mySubmission.late && (
                    <span style={{ marginLeft: 6, color: '#EF4444', fontSize: 12, fontWeight: 600 }}>Late</span>
                  )}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 4 }}>
                <button
                  type="button"
                  className="res-btn res-btn--sm res-btn--ghost"
                  onClick={() => onDownloadSubmission(mySubmission.id, mySubmission.originalName)}
                >
                  Download
                </button>
                {/* Resubmit: replaces existing */}
                <input
                  ref={resubmitInputRef}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onSubmit(assignment.id, file);
                      setShowMySubmission(false);
                    }
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  className="res-btn res-btn--sm res-btn--primary"
                  disabled={isSubmitting}
                  onClick={() => resubmitInputRef.current?.click()}
                >
                  {isSubmitting ? 'Submitting…' : 'Resubmit'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {isExpanded && submissions && (
        <div style={{ marginTop: 'var(--space-3)' }}>
          <SubmissionsTable
            rows={submissions}
            onDownload={onDownloadSubmission}
          />
        </div>
      )}
    </div>
  );
};

export default AssignmentItem;
