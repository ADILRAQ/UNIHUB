import { useRef } from 'react';
import type { AssignmentDto, SubmissionStatusDto } from '../types';
import SubmissionsTable from './SubmissionsTable';

interface AssignmentItemProps {
  assignment: AssignmentDto;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isExpanded: boolean;
  submissions: SubmissionStatusDto[] | undefined;
  isSubmitting: boolean;
  onToggleSubmissions: (id: number) => void;
  onSubmit: (assignmentId: number, file: File) => void;
  onDelete: (id: number) => void;
  onDownloadSubmission: (submissionId: number, filename: string) => void;
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
  onToggleSubmissions,
  onSubmit,
  onDelete,
  onDownloadSubmission,
}: AssignmentItemProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStudent = role === 'STUDENT';
  const isTeacherOrAdmin = role === 'TEACHER' || role === 'ADMIN';
  const dueDate = new Date(assignment.dueAt);
  const isPast = dueDate < new Date();

  const canUpload =
    isStudent &&
    (assignment.mySubmissionStatus == null ||
      assignment.mySubmissionStatus === 'MISSING' ||
      assignment.mySubmissionStatus === 'LATE_SUBMITTED');

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
          {dueDate.toLocaleString()}
        </span>
        {isPast && <span style={{ marginLeft: 'var(--space-1)', color: 'var(--color-danger-dark)' }}>Overdue</span>}
      </p>

      {assignment.description && (
        <p className="res-assignment__meta">{assignment.description}</p>
      )}

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
