import React, { useRef, useState, useEffect } from 'react';
import { getProofBlobUrl } from '../services/paymentService';
import useStudentPayments from '../hooks/useStudentPayments';
import useAdminPayments from '../hooks/useAdminPayments';
import usePaymentsPage from '../hooks/usePaymentsPage';
import usePlanTab from '../hooks/usePlanTab';
import PageHeader from '../../../components/layout/PageHeader';
import Tabs from '../../../components/ui/Tabs';
import type { InstallmentDto, CreateYearPlanPayload, PendingProofItemDto, OverdueStudentDto, PaymentPeriodDto } from '../types';
import type { ClassGroupDto } from '../../../api/types';

/* ── Helpers ──────────────────────────────────────────────────────────── */

const MAD_WHOLE = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 });
const MAD_CENTS = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 2 });

// "1.500 MAD" for whole amounts, "1.500,50 MAD" when there are cents.
const formatAmount = (amount: number): string =>
  (Number.isInteger(amount) ? MAD_WHOLE : MAD_CENTS).format(amount);

const daysLabel = (dueDate: string): string => {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - now.getTime()) / 86_400_000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  return `${diff}d remaining`;
};

const STATUS_BADGE: Record<InstallmentDto['status'], { cls: string; label: string }> = {
  LOCKED:          { cls: 'badge--neutral', label: 'Locked' },
  UNPAID:          { cls: 'badge--warning', label: 'Unpaid' },
  PROOF_SUBMITTED: { cls: 'badge--neutral', label: 'In review' },
  PAID:            { cls: 'badge--success', label: 'Paid' },
  REJECTED:        { cls: 'badge--danger',  label: 'Rejected' },
};

const badge = (status: InstallmentDto['status']) => {
  const { cls, label } = STATUS_BADGE[status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

const muted = { margin: 0, fontSize: 14, color: 'var(--ink-500)' };

/* ── Student view ──────────────────────────────────────────────────── */

const StudentPaymentsView = () => {
  const { academicYear, installments, isLoading, isError, uploadingId, uploadFeedback, uploadProof } = useStudentPayments();

  if (isLoading) return <div className="skeleton" style={{ height: 220 }} />;
  if (isError) return <p className="alert" role="alert">Failed to load payments. Please try again.</p>;

  if (installments.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'var(--orange-100)', color: 'var(--orange-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <line x1="6" y1="15" x2="10" y2="15" />
          </svg>
        </div>
        <h2 className="empty-state__title">No payment plan yet</h2>
        <p className="empty-state__body">
          The administration has not set up the {academicYear} tuition installments for your class group yet.
          Once it is configured, your 3 installments and their due dates will appear here.
        </p>
      </div>
    );
  }

  const total = installments.reduce((sum, ins) => sum + ins.amount, 0);
  const paidCount = installments.filter((ins) => ins.status === 'PAID').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, background: 'var(--cream-100)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
        {[
          { value: academicYear, label: 'Academic year' },
          { value: formatAmount(total), label: 'Total tuition' },
          { value: `${paidCount}/${installments.length}`, label: 'Installments paid' },
        ].map((stat) => (
          <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 20, lineHeight: '28px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>{stat.value}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>{stat.label}</span>
          </div>
        ))}
        <div className="progress" style={{ gridColumn: '1 / -1', marginTop: 8 }} role="progressbar" aria-valuenow={paidCount} aria-valuemin={0} aria-valuemax={installments.length} aria-label="Installments paid">
          <span style={{ width: `${Math.round((paidCount / installments.length) * 100)}%` }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {installments.map((ins) => {
          const isUploading = uploadingId === ins.id;
          const feedback = uploadFeedback[ins.id];
          return (
            <InstallmentCard
              key={ins.id}
              installment={ins}
              isUploading={isUploading}
              feedback={feedback}
              onUpload={uploadProof}
            />
          );
        })}
      </div>
    </div>
  );
};

interface InstallmentCardProps {
  installment: InstallmentDto;
  isUploading: boolean;
  feedback: string | undefined;
  onUpload: (id: number, file: File) => void;
}

const InstallmentCard = ({ installment, isUploading, feedback, onUpload }: InstallmentCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canUpload = installment.status === 'UNPAID' || installment.status === 'REJECTED';

  const cardStyle: React.CSSProperties = installment.status === 'LOCKED'
    ? { background: 'var(--cream-100)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, opacity: 0.75, display: 'flex', flexDirection: 'column', gap: 12 }
    : installment.status === 'UNPAID'
      ? { background: 'var(--white)', border: '1px solid var(--orange-200)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: '0 0 0 3px var(--orange-50)', display: 'flex', flexDirection: 'column', gap: 12 }
      : { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column', gap: 12 };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="label">{installment.label}</span>
          <span style={{ fontSize: 20, lineHeight: '28px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>{formatAmount(installment.amount)}</span>
        </div>
        {badge(installment.status)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: installment.overdue && installment.status === 'UNPAID' ? 'var(--danger-700)' : 'var(--ink-500)' }}>
        {installment.status === 'PAID' ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Paid</span>
          </>
        ) : installment.status === 'LOCKED' ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-500)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Available after previous installment</span>
          </>
        ) : installment.status === 'PROOF_SUBMITTED' ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-700)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Proof submitted · awaiting review</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Due {installment.dueDate} · {daysLabel(installment.dueDate)}</span>
          </>
        )}
      </div>

      {installment.status === 'REJECTED' && installment.rejectionReason && (
        <p className="alert" style={{ margin: 0 }}>Rejected: {installment.rejectionReason}</p>
      )}

      {canUpload && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
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
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="btn btn--primary"
            style={{ width: '100%' }}
          >
            {isUploading ? 'Uploading…' : installment.status === 'REJECTED' ? 'Re-upload proof' : 'Upload proof'}
          </button>
          <span style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-500)' }}>
            {feedback ?? 'JPEG, PNG or PDF · max 10 MB'}
          </span>
        </div>
      )}
    </div>
  );
};

/* ── Admin view ──────────────────────────────────────────────────────── */

const TABS = [
  { key: 'queue' as const, label: 'Pending proofs' },
  { key: 'overdue' as const, label: 'Overdue students' },
  { key: 'plan' as const, label: 'Year plan setup' },
];

const AdminPaymentsView = () => {
  const {
    activeTab, setActiveTab, queue, isLoadingQueue, isErrorQueue,
    approvingId, rejectingId, rejectReason, setRejectReason, rejectTargetId,
    openReject, cancelReject, approveItem, confirmReject,
    overdueList, isLoadingOverdue, classGroups, selectedGroupId, setSelectedGroupId,
    yearPlans, isLoadingPlans, createYearPlan, isCreatingPlan, planError,
  } = useAdminPayments();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Tabs
        tabs={TABS.map((t) => (t.key === 'queue' && !isLoadingQueue ? { ...t, count: queue.length } : t))}
        active={activeTab}
        onSelect={setActiveTab}
        label="Payment sections"
      />

      {activeTab === 'queue' && (
        <QueueTab queue={queue} isLoading={isLoadingQueue} isError={isErrorQueue}
          approvingId={approvingId} rejectingId={rejectingId}
          rejectTargetId={rejectTargetId} rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          onApprove={approveItem} onOpenReject={openReject}
          onCancelReject={cancelReject} onConfirmReject={confirmReject} />
      )}
      {activeTab === 'overdue' && (
        <OverdueTab overdueList={overdueList} isLoading={isLoadingOverdue}
          classGroups={classGroups} selectedGroupId={selectedGroupId}
          onGroupChange={setSelectedGroupId} />
      )}
      {activeTab === 'plan' && (
        <PlanTab yearPlans={yearPlans} isLoading={isLoadingPlans} classGroups={classGroups}
          onCreatePlan={createYearPlan} isCreating={isCreatingPlan} planError={planError} />
      )}
    </div>
  );
};

/* ── Queue tab ─────────────────────────────────────────────────────── */

interface QueueTabProps {
  queue: PendingProofItemDto[];
  isLoading: boolean; isError: boolean;
  approvingId: number | null; rejectingId: number | null;
  rejectTargetId: number | null; rejectReason: string;
  setRejectReason: (v: string) => void;
  onApprove: (id: number) => void; onOpenReject: (id: number) => void;
  onCancelReject: () => void; onConfirmReject: () => void;
}

type PreviewState = { url: string; type: string; item: PendingProofItemDto };

const QueueTab = ({ queue, isLoading, isError, approvingId, rejectingId, rejectTargetId, rejectReason, setRejectReason, onApprove, onOpenReject, onCancelReject, onConfirmReject }: QueueTabProps) => {
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [loadingProofId, setLoadingProofId] = useState<number | null>(null);
  const [previewError, setPreviewError] = useState<{ id: number; name: string } | null>(null);

  const openPreview = async (item: PendingProofItemDto) => {
    setLoadingProofId(item.installmentId);
    setPreviewError(null);
    try {
      const result = await getProofBlobUrl(item.installmentId);
      setPreview({ ...result, item });
    } catch {
      // Approve/reject live in the preview, so a proof that can't load must not dead-end the review.
      setPreviewError({ id: item.installmentId, name: item.studentName });
    } finally {
      setLoadingProofId(null);
    }
  };

  const closePreview = () => setPreview(null);

  // Revoke each blob URL when it's replaced, closed, or the tab unmounts.
  useEffect(() => {
    if (!preview) return;
    const { url } = preview;
    return () => window.URL.revokeObjectURL(url);
  }, [preview]);

  // Close the preview once its proof has been approved/rejected and left the queue.
  useEffect(() => {
    if (preview && !queue.some((q) => q.installmentId === preview.item.installmentId)) setPreview(null);
    if (previewError && !queue.some((q) => q.installmentId === previewError.id)) setPreviewError(null);
  }, [preview, previewError, queue]);

  if (isLoading) return <div className="skeleton" style={{ height: 160 }} />;
  if (isError) return <p className="alert" role="alert">Failed to load the proof queue. Please try again.</p>;
  if (queue.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="empty-state__title">All caught up</h2>
        <p className="empty-state__body">No payment proofs are waiting for review.</p>
      </div>
    );
  }

  return (
    <>
      {preview && (
        <div className="dialog-overlay" onClick={closePreview}>
          <div className="dialog" role="dialog" aria-modal="true" aria-label={`Payment proof from ${preview.item.studentName}`} onClick={(e) => e.stopPropagation()} style={{ overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-900)' }}>{preview.item.studentName}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 3 }}>{preview.item.classGroup} · Installment {preview.item.installmentNumber} · {formatAmount(preview.item.amount)}</div>
              </div>
              <button type="button" className="btn btn--icon btn--sm" aria-label="Close" onClick={closePreview} style={{ fontSize: 20 }}>×</button>
            </div>

            {/* Proof image */}
            <div style={{ background: 'var(--cream-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '55vh', overflow: 'auto' }}>
              {preview.type.includes('pdf')
                ? <embed src={preview.url} type="application/pdf" style={{ width: '100%', height: '55vh' }} />
                : <img src={preview.url} alt="Payment proof" style={{ display: 'block', maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain' }} />
              }
            </div>

            {/* Actions */}
            <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rejectTargetId === preview.item.installmentId ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text" placeholder="Rejection reason…" value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)} autoFocus
                    className="input" aria-label="Rejection reason" style={{ flexGrow: 1 }}
                  />
                  <button type="button" className="btn btn--danger" disabled={!rejectReason.trim() || rejectingId != null} onClick={onConfirmReject}>
                    {rejectingId === preview.item.installmentId ? 'Rejecting…' : 'Confirm reject'}
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={onCancelReject}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    disabled={approvingId === preview.item.installmentId || rejectingId === preview.item.installmentId}
                    onClick={() => onApprove(preview.item.installmentId)}
                    className="btn btn--primary" style={{ flex: 1 }}
                  >
                    {approvingId === preview.item.installmentId ? 'Approving…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={approvingId === preview.item.installmentId || rejectingId === preview.item.installmentId}
                    onClick={() => onOpenReject(preview.item.installmentId)}
                    className="btn btn--danger" style={{ flex: 1 }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {previewError && (
        <div role="alert" className="alert" style={{ alignItems: 'center', marginBottom: 16 }}>
          <span style={{ flex: 1 }}>Couldn&apos;t load the proof from {previewError.name}. It may be missing or unreadable.</span>
          {rejectTargetId === previewError.id ? (
            <>
              <input type="text" placeholder="Rejection reason…" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} autoFocus className="input" aria-label="Rejection reason" style={{ maxWidth: 260, background: 'var(--white)' }} />
              <button type="button" className="btn btn--danger btn--sm" disabled={!rejectReason.trim() || rejectingId != null} onClick={onConfirmReject}>Confirm reject</button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={onCancelReject}>Cancel</button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn--sm" onClick={() => onOpenReject(previewError.id)}>Reject as unreadable</button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPreviewError(null)}>Dismiss</button>
            </>
          )}
        </div>
      )}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th><th>Class group</th><th>Installment</th><th>Amount</th><th>Submitted</th>
              <th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {queue.map((item) => (
              <tr key={item.installmentId}>
                <td style={{ color: 'var(--ink-900)', fontWeight: 500 }}>{item.studentName}</td>
                <td>{item.classGroup}</td>
                <td>Installment {item.installmentNumber}</td>
                <td style={{ color: 'var(--ink-900)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatAmount(item.amount)}</td>
                <td style={{ fontSize: 12, color: 'var(--ink-500)' }}>{new Date(item.submittedAt).toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>
                  {/* ponytail: approve/reject live in the preview so nobody decides without seeing the proof */}
                  <button type="button" className="btn btn--sm" disabled={loadingProofId === item.installmentId} onClick={() => openPreview(item)}>
                    {loadingProofId === item.installmentId ? 'Loading…' : 'Review'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

/* ── Overdue tab ─────────────────────────────────────────────────────── */

interface OverdueTabProps {
  overdueList: OverdueStudentDto[];
  isLoading: boolean;
  classGroups: ClassGroupDto[];
  selectedGroupId: number | undefined;
  onGroupChange: (id: number | undefined) => void;
}

const OverdueTab = ({ overdueList, isLoading, classGroups, selectedGroupId, onGroupChange }: OverdueTabProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <select className="select" aria-label="Filter by class group" value={selectedGroupId ?? ''} onChange={(e) => onGroupChange(e.target.value ? Number(e.target.value) : undefined)} style={{ width: 240 }}>
      <option value="">All class groups</option>
      {classGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
    </select>
    {isLoading && <div className="skeleton" style={{ height: 120 }} />}
    {!isLoading && overdueList.length === 0 && <p style={muted}>No overdue students.</p>}
    {!isLoading && overdueList.length > 0 && (
      <div className="table-card">
        <table className="data-table">
          <thead><tr><th>Student</th><th>Class group</th><th>Overdue installments</th></tr></thead>
          <tbody>
            {overdueList.map((s) => (
              <tr key={s.studentId}>
                <td style={{ color: 'var(--ink-900)', fontWeight: 500 }}>{s.studentName}</td>
                <td>{s.classGroupName}</td>
                <td>
                  <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6 }}>
                    {s.overdueInstallments.map((ins) => (
                      <span key={ins.label} className={`badge ${ins.status === 'UNPAID' ? 'badge--danger' : 'badge--warning'}`}>{ins.label}</span>
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

/* ── Year plan tab ─────────────────────────────────────────────────── */

interface PlanTabProps {
  yearPlans: Record<string, PaymentPeriodDto[]>;
  isLoading: boolean;
  classGroups: ClassGroupDto[];
  onCreatePlan: (data: CreateYearPlanPayload, onCreated?: () => void) => void;
  isCreating: boolean;
  planError: string | null;
}

const PlanTab = ({ yearPlans, isLoading, classGroups, onCreatePlan, isCreating, planError }: PlanTabProps) => {
  const {
    groupedPlans, yearOptions, academicYear, classGroupId, rows, formError,
    setAcademicYear, setClassGroupId, updateRow, handleSubmit,
  } = usePlanTab(yearPlans, onCreatePlan);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {isLoading && <div className="skeleton" style={{ height: 120 }} />}
      {!isLoading && groupedPlans.length === 0 && <p style={muted}>No payment plans configured yet.</p>}
      {groupedPlans.map(({ year, groups }) => (
        <div key={year} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 className="section-title">Academic year {year}</h3>
          {groups.map((g) => (
            <div key={g.classGroupId}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: 'var(--ink-700)' }}>{g.classGroupName}</h4>
              <div className="table-card">
                <table className="data-table">
                  <thead><tr><th>Label</th><th>Amount</th><th>Due date</th></tr></thead>
                  <tbody>
                    {g.periods.map((p) => (
                      <tr key={p.id}>
                        <td style={{ color: 'var(--ink-900)' }}>{p.label}</td>
                        <td style={{ color: 'var(--ink-900)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatAmount(p.amount)}</td>
                        <td>{p.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--ink-900)' }}>Create plan</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="plan-academic-year" className="label">Academic year</label>
            <select id="plan-academic-year" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="select" style={{ width: 200 }}>
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="plan-class-group" className="label">Class group</label>
            <select id="plan-class-group" value={classGroupId} onChange={(e) => setClassGroupId(e.target.value)} className="select" style={{ width: 240 }}>
              <option value="">Select a class group</option>
              {classGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        </div>
        {rows.map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 120px 150px', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 600 }}>{i + 1}.</span>
            <input type="text" placeholder="Label (e.g. Installment 1)" value={row.label} onChange={(e) => updateRow(i, 'label', e.target.value)} className="input" />
            <input type="number" placeholder="Amount" min={1} value={row.amount} onChange={(e) => updateRow(i, 'amount', e.target.value)} className="input" />
            <input type="date" value={row.dueDate} onChange={(e) => updateRow(i, 'dueDate', e.target.value)} className="input" />
          </div>
        ))}
        {(formError ?? planError) && (
          <div role="alert" className="alert">{formError ?? planError}</div>
        )}
        <button type="button" className="btn btn--primary" disabled={isCreating} onClick={handleSubmit} style={{ alignSelf: 'flex-start' }}>
          {isCreating ? 'Creating…' : 'Create plan'}
        </button>
      </div>
    </div>
  );
};

/* ── Root page ───────────────────────────────────────────────────────── */

const PaymentsPage = () => {
  const { viewType } = usePaymentsPage();
  return (
    <>
      <PageHeader
        title="Payments"
        subtitle={viewType === 'admin' ? 'Review proofs, follow up on overdue students, set up year plans' : 'Your three tuition installments'}
      />
      <div className="page-body">
        {viewType === 'student' && <StudentPaymentsView />}
        {viewType === 'admin' && <AdminPaymentsView />}
      </div>
    </>
  );
};

export default PaymentsPage;
