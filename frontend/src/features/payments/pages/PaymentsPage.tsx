import React, { useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import useStudentPayments from '../hooks/useStudentPayments';
import useAdminPayments from '../hooks/useAdminPayments';
import type { InstallmentDto, CreatePeriodEntry } from '../types';

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const formatAmount = (amount: number): string =>
  `${amount.toLocaleString('fr-DZ')} DA`;

const daysLabel = (dueDate: string): string => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - now.getTime()) / 86_400_000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  return `${diff}d remaining`;
};

const statusBadgeClass: Record<InstallmentDto['status'], string> = {
  LOCKED: 'pay-badge--locked',
  UNPAID: 'pay-badge--unpaid',
  PROOF_SUBMITTED: 'pay-badge--submitted',
  PAID: 'pay-badge--paid',
  REJECTED: 'pay-badge--rejected',
};

const statusLabel: Record<InstallmentDto['status'], string> = {
  LOCKED: 'Locked',
  UNPAID: 'Unpaid',
  PROOF_SUBMITTED: 'Pending review',
  PAID: 'Paid',
  REJECTED: 'Rejected',
};

/* ── Student view ──────────────────────────────────────────────────────────── */

const StudentPaymentsView = () => {
  const { installments, isLoading, isError, uploadingId, uploadFeedback, uploadProof } =
    useStudentPayments();

  if (isLoading) return <p className="pay-empty">Loading…</p>;
  if (isError) return <p className="pay-empty" style={{ color: 'var(--color-danger-dark)' }}>Failed to load payments.</p>;

  return (
    <div className="pay-installments">
      {installments.map((ins) => {
        const canUpload =
          ins.status === 'UNPAID' || ins.status === 'REJECTED';
        const isUploading = uploadingId === ins.id;
        const feedback = uploadFeedback[ins.id];

        return (
          <InstallmentCard
            key={ins.id}
            installment={ins}
            isUploading={isUploading}
            feedback={feedback}
            canUpload={canUpload}
            onUpload={uploadProof}
          />
        );
      })}
    </div>
  );
};

interface InstallmentCardProps {
  installment: InstallmentDto;
  isUploading: boolean;
  feedback: string | undefined;
  canUpload: boolean;
  onUpload: (id: number, file: File) => void;
}

const InstallmentCard = ({
  installment,
  isUploading,
  feedback,
  canUpload,
  onUpload,
}: InstallmentCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="pay-card">
      <p className="pay-card__label">{installment.label}</p>
      <p className="pay-card__amount">{formatAmount(installment.amount)}</p>
      <p className="pay-card__due">Due: {installment.dueDate}</p>
      <p className="pay-card__days">{daysLabel(installment.dueDate)}</p>

      <span className={`pay-badge ${statusBadgeClass[installment.status]}`}>
        {statusLabel[installment.status]}
      </span>

      {installment.overdue && installment.status !== 'PAID' && (
        <p className="pay-overdue-flag">Overdue</p>
      )}

      {installment.status === 'REJECTED' && installment.rejectionReason && (
        <p className="pay-rejection-reason">{installment.rejectionReason}</p>
      )}

      {canUpload && (
        <div className={`pay-upload${isUploading ? ' pay-upload--loading' : ''}`}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(installment.id, file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="pay-upload__btn"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {installment.status === 'REJECTED' ? 'Re-upload proof' : 'Upload proof'}
          </button>
          {feedback && (
            <span className="pay-upload__feedback">{feedback}</span>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Admin view ────────────────────────────────────────────────────────────── */

const AdminPaymentsView = () => {
  const {
    activeTab,
    setActiveTab,
    queue,
    isLoadingQueue,
    isErrorQueue,
    approvingId,
    rejectingId,
    rejectReason,
    setRejectReason,
    rejectTargetId,
    openReject,
    cancelReject,
    approveItem,
    confirmReject,
    downloadProof,
    overdueList,
    isLoadingOverdue,
    classGroups,
    selectedGroupId,
    setSelectedGroupId,
    yearPlans,
    isLoadingPlans,
    createYearPlan,
    isCreatingPlan,
    planError,
  } = useAdminPayments();

  return (
    <div>
      <div className="pay-admin-tabs">
        {(['queue', 'overdue', 'plan'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`pay-admin-tab${activeTab === tab ? ' pay-admin-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'queue'
              ? 'Pending proofs'
              : tab === 'overdue'
                ? 'Overdue students'
                : 'Year plan setup'}
          </button>
        ))}
      </div>

      {activeTab === 'queue' && (
        <QueueTab
          queue={queue}
          isLoading={isLoadingQueue}
          isError={isErrorQueue}
          approvingId={approvingId}
          rejectingId={rejectingId}
          rejectTargetId={rejectTargetId}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          onApprove={approveItem}
          onOpenReject={openReject}
          onCancelReject={cancelReject}
          onConfirmReject={confirmReject}
          onDownloadProof={downloadProof}
        />
      )}

      {activeTab === 'overdue' && (
        <OverdueTab
          overdueList={overdueList}
          isLoading={isLoadingOverdue}
          classGroups={classGroups}
          selectedGroupId={selectedGroupId}
          onGroupChange={setSelectedGroupId}
        />
      )}

      {activeTab === 'plan' && (
        <PlanTab
          yearPlans={yearPlans}
          isLoading={isLoadingPlans}
          onCreatePlan={createYearPlan}
          isCreating={isCreatingPlan}
          planError={planError}
        />
      )}
    </div>
  );
};

/* ── Queue tab ───────────────────────────────────────────────────────────── */

interface QueueTabProps {
  queue: ReturnType<typeof useAdminPayments>['queue'];
  isLoading: boolean;
  isError: boolean;
  approvingId: number | null;
  rejectingId: number | null;
  rejectTargetId: number | null;
  rejectReason: string;
  setRejectReason: (v: string) => void;
  onApprove: (id: number) => void;
  onOpenReject: (id: number) => void;
  onCancelReject: () => void;
  onConfirmReject: () => void;
  onDownloadProof: (id: number, filename: string) => Promise<void>;
}

const QueueTab = ({
  queue,
  isLoading,
  isError,
  approvingId,
  rejectingId,
  rejectTargetId,
  rejectReason,
  setRejectReason,
  onApprove,
  onOpenReject,
  onCancelReject,
  onConfirmReject,
  onDownloadProof,
}: QueueTabProps) => {
  if (isLoading) return <p className="pay-empty">Loading queue…</p>;
  if (isError) return <p className="pay-empty" style={{ color: 'var(--color-danger-dark)' }}>Failed to load queue.</p>;
  if (queue.length === 0)
    return <p className="pay-empty">No proofs awaiting validation.</p>;

  return (
    <div className="pay-table-wrap">
      <table className="pay-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Class group</th>
            <th>Installment</th>
            <th>Amount</th>
            <th>Due date</th>
            <th>Submitted</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {queue.map((item) => (
            <React.Fragment key={item.installmentId}>
              <tr>
                <td>{item.studentName}</td>
                <td>{item.classGroupName}</td>
                <td>{item.label}</td>
                <td>{formatAmount(item.amount)}</td>
                <td>{item.dueDate}</td>
                <td>{new Date(item.submittedAt).toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="pay-btn pay-btn--sm"
                      onClick={() =>
                        onDownloadProof(
                          item.installmentId,
                          `proof-${item.studentName}-${item.label}`,
                        )
                      }
                    >
                      View proof
                    </button>
                    <button
                      type="button"
                      className="pay-btn pay-btn--sm pay-btn--approve"
                      disabled={
                        approvingId === item.installmentId ||
                        rejectingId === item.installmentId
                      }
                      onClick={() => onApprove(item.installmentId)}
                    >
                      {approvingId === item.installmentId ? 'Approving…' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      className="pay-btn pay-btn--sm pay-btn--reject"
                      disabled={
                        approvingId === item.installmentId ||
                        rejectingId === item.installmentId
                      }
                      onClick={() => onOpenReject(item.installmentId)}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
              {rejectTargetId === item.installmentId && (
                <tr key={`reject-${item.installmentId}`}>
                  <td colSpan={7}>
                    <div className="pay-reject-inline">
                      <input
                        type="text"
                        placeholder="Rejection reason…"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="pay-btn pay-btn--sm pay-btn--reject"
                        disabled={!rejectReason.trim() || rejectingId != null}
                        onClick={onConfirmReject}
                      >
                        {rejectingId === item.installmentId
                          ? 'Rejecting…'
                          : 'Confirm reject'}
                      </button>
                      <button
                        type="button"
                        className="pay-btn pay-btn--sm"
                        onClick={onCancelReject}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ── Overdue tab ─────────────────────────────────────────────────────────── */

interface OverdueTabProps {
  overdueList: ReturnType<typeof useAdminPayments>['overdueList'];
  isLoading: boolean;
  classGroups: ReturnType<typeof useAdminPayments>['classGroups'];
  selectedGroupId: number | undefined;
  onGroupChange: (id: number | undefined) => void;
}

const OverdueTab = ({
  overdueList,
  isLoading,
  classGroups,
  selectedGroupId,
  onGroupChange,
}: OverdueTabProps) => (
  <div>
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <select
        value={selectedGroupId ?? ''}
        onChange={(e) =>
          onGroupChange(e.target.value ? Number(e.target.value) : undefined)
        }
        className="select"
      >
        <option value="">All class groups</option>
        {classGroups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </div>

    {isLoading && <p className="pay-empty">Loading…</p>}

    {!isLoading && overdueList.length === 0 && (
      <p className="pay-empty">No overdue students.</p>
    )}

    {!isLoading && overdueList.length > 0 && (
      <div className="pay-table-wrap">
        <table className="pay-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class group</th>
              <th>Overdue installments</th>
            </tr>
          </thead>
          <tbody>
            {overdueList.map((student) => (
              <tr
                key={student.studentId}
                style={{
                  background: student.overdueInstallments.some(
                    (ins) => ins.status === 'UNPAID',
                  )
                    ? 'var(--color-warning-light)'
                    : undefined,
                }}
              >
                <td>{student.studentName}</td>
                <td>{student.classGroupName}</td>
                <td>
                  {student.overdueInstallments
                    .map((ins) => ins.label)
                    .join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

/* ── Year plan setup tab ─────────────────────────────────────────────────── */

const EMPTY_ROW = (): { label: string; amount: string; dueDate: string } => ({
  label: '',
  amount: '',
  dueDate: '',
});

interface PlanTabProps {
  yearPlans: Record<string, ReturnType<typeof useAdminPayments>['yearPlans'][string]>;
  isLoading: boolean;
  onCreatePlan: (data: { academicYear: string; periods: CreatePeriodEntry[] }) => void;
  isCreating: boolean;
  planError: string | null;
}

const PlanTab = ({
  yearPlans,
  isLoading,
  onCreatePlan,
  isCreating,
  planError,
}: PlanTabProps) => {
  const [academicYear, setAcademicYear] = useState('');
  const [rows, setRows] = useState([EMPTY_ROW(), EMPTY_ROW(), EMPTY_ROW()]);
  const [formError, setFormError] = useState<string | null>(null);

  const updateRow = (
    index: number,
    field: 'label' | 'amount' | 'dueDate',
    value: string,
  ) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = () => {
    setFormError(null);
    if (!academicYear.trim()) {
      setFormError('Academic year is required.');
      return;
    }
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.label.trim() || !row.amount || !row.dueDate) {
        setFormError(`Row ${i + 1}: all fields are required.`);
        return;
      }
      if (Number(row.amount) <= 0) {
        setFormError(`Row ${i + 1}: amount must be greater than 0.`);
        return;
      }
    }
    // Validate date order
    if (rows[0].dueDate >= rows[1].dueDate || rows[1].dueDate >= rows[2].dueDate) {
      setFormError('Due dates must be in order: installment 1 < 2 < 3.');
      return;
    }

    const periods: CreatePeriodEntry[] = rows.map((row, i) => ({
      label: row.label.trim(),
      amount: Number(row.amount),
      dueDate: row.dueDate,
      periodOrder: i + 1,
    }));

    onCreatePlan({ academicYear: academicYear.trim(), periods });
  };

  return (
    <div>
      {/* Existing plans */}
      {isLoading && <p className="pay-empty">Loading plans…</p>}
      {!isLoading && Object.keys(yearPlans).length === 0 && (
        <p className="pay-empty" style={{ marginBottom: 'var(--space-6)' }}>
          No year plans configured yet.
        </p>
      )}
      {Object.entries(yearPlans).map(([year, periods]) => (
        <div key={year} style={{ marginBottom: 'var(--space-5)' }}>
          <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-base)' }}>
            Academic year: {year}
          </h3>
          <div className="pay-table-wrap">
            <table className="pay-table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Amount</th>
                  <th>Due date</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p) => (
                  <tr key={p.id}>
                    <td>{p.label}</td>
                    <td>{formatAmount(p.amount)}</td>
                    <td>{p.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Create form */}
      <h3 style={{ margin: 'var(--space-6) 0 var(--space-3)', fontSize: 'var(--text-base)' }}>
        Create new year plan
      </h3>
      <div className="pay-plan-form">
        <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
          <label className="label">Academic year</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. 2025-2026"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
        </div>

        {rows.map((row, i) => (
          <div key={i} className="pay-plan-row">
            <span className="text-sm text-muted" style={{ minWidth: '1.5rem' }}>
              {i + 1}.
            </span>
            <input
              type="text"
              placeholder="Label (e.g. Installment 1)"
              value={row.label}
              onChange={(e) => updateRow(i, 'label', e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              min={1}
              value={row.amount}
              onChange={(e) => updateRow(i, 'amount', e.target.value)}
            />
            <input
              type="date"
              value={row.dueDate}
              onChange={(e) => updateRow(i, 'dueDate', e.target.value)}
            />
          </div>
        ))}

        {(formError ?? planError) && (
          <div className="alert alert--danger">
            {formError ?? planError}
          </div>
        )}

        <button
          type="button"
          className="pay-btn pay-btn--approve"
          disabled={isCreating}
          onClick={handleSubmit}
        >
          {isCreating ? 'Creating…' : 'Create year plan'}
        </button>
      </div>
    </div>
  );
};

/* ── Root page ───────────────────────────────────────────────────────────── */

const PaymentsPage = () => {
  const { user } = useAuth();

  return (
    <div className="pay-page">
      <h1 className="pay-page__title">Payments</h1>
      {user?.role === 'STUDENT' && <StudentPaymentsView />}
      {user?.role === 'ADMIN' && <AdminPaymentsView />}
      {user?.role === 'TEACHER' && (
        <p className="pay-empty">Payment management is handled by administrators.</p>
      )}
    </div>
  );
};

export default PaymentsPage;
