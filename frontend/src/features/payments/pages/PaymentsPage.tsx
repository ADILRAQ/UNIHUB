import React, { useRef, useState, useEffect } from 'react';
import { getProofBlobUrl } from '../services/paymentService';
import useStudentPayments from '../hooks/useStudentPayments';
import useAdminPayments from '../hooks/useAdminPayments';
import usePaymentsPage from '../hooks/usePaymentsPage';
import usePlanTab from '../hooks/usePlanTab';
import PageHeader from '../../../components/layout/PageHeader';
import type { InstallmentDto, CreateYearPlanPayload, PendingProofItemDto, OverdueStudentDto, PaymentPeriodDto } from '../types';
import type { ClassGroupDto } from '../../admin/types';

/* ── Helpers ──────────────────────────────────────────────────────────── */

const formatAmount = (amount: number): string => `${amount.toLocaleString('fr-DZ')} DA`;

const daysLabel = (dueDate: string): string => {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - now.getTime()) / 86_400_000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  return `${diff}d remaining`;
};

const STATUS_BADGE: Record<InstallmentDto['status'], { bg: string; color: string; label: string }> = {
  LOCKED:           { bg: '#F5F4FA', color: '#8D8B9C', label: 'Locked' },
  UNPAID:           { bg: '#FEF3E2', color: '#B8650A', label: 'Unpaid' },
  PROOF_SUBMITTED:  { bg: '#E8F1FF', color: '#1D5FC2', label: 'Pending review' },
  PAID:             { bg: '#EAFBF3', color: '#0F8F5F', label: 'Paid' },
  REJECTED:         { bg: '#FFE8E8', color: '#B02F2F', label: 'Rejected' },
};

const badge = (status: InstallmentDto['status']) => {
  const { bg, color, label } = STATUS_BADGE[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 999, background: bg, color, fontSize: 12, fontWeight: 600 }}>
      {label}
    </span>
  );
};

/* ── Student view ──────────────────────────────────────────────────── */

const StudentPaymentsView = () => {
  const { installments, isLoading, isError, uploadingId, uploadFeedback, uploadProof } = useStudentPayments();

  if (isLoading) return <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>Loading…</p>;
  if (isError) return <p style={{ margin: 0, fontSize: 14, color: '#B91C1C' }}>Failed to load payments.</p>;

  if (installments.length === 0) {
    return (
      <div className="empty-state" style={{ background: '#FFFFFF', border: '1px dashed #DCD9EE', borderRadius: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: '#F5F4FA', color: '#8D8B9C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <line x1="6" y1="15" x2="10" y2="15" />
          </svg>
        </div>
        <h2 className="empty-state__title">No payment plan yet</h2>
        <p className="empty-state__body">
          The administration has not set up the tuition installments for your class group yet.
          Once it is configured, your 3 installments and their due dates will appear here.
        </p>
      </div>
    );
  }

  const total = installments.reduce((sum, ins) => sum + ins.amount, 0);
  const paidCount = installments.filter((ins) => ins.status === 'PAID').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 12, padding: '14px 20px' }}>
        <span style={{ fontSize: 14, color: '#45435A', fontWeight: 500 }}>
          {formatAmount(total)} total · {installments.length} installments
        </span>
        <span style={{ fontSize: 13.5, color: paidCount === installments.length ? '#0F8F5F' : '#45435A', fontWeight: 600 }}>
          {paidCount} of {installments.length} paid
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20 }}>
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
    ? { background: '#F5F4FA', border: '1px solid #EDEBF8', borderRadius: 16, padding: 24, opacity: 0.75, display: 'flex', flexDirection: 'column', gap: 12 }
    : installment.status === 'UNPAID'
      ? { background: '#FFFFFF', border: '2px solid #6C63FF', borderRadius: 16, padding: 24, boxShadow: '0 4px 18px rgba(108,99,255,0.14)', display: 'flex', flexDirection: 'column', gap: 12 }
      : { background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(108,99,255,0.05)', display: 'flex', flexDirection: 'column', gap: 12 };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>{installment.label}</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#1F1B33', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{formatAmount(installment.amount)}</span>
        </div>
        {badge(installment.status)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: installment.overdue && installment.status === 'UNPAID' ? '#B02F2F' : '#6B6B7B' }}>
        {installment.status === 'PAID' ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F8F5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Paid</span>
          </>
        ) : installment.status === 'LOCKED' ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8D8B9C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Available after previous installment</span>
          </>
        ) : installment.status === 'PROOF_SUBMITTED' ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D5FC2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
        <div style={{ background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, color: '#B91C1C' }}>
          {installment.rejectionReason}
        </div>
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
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 46, border: 0, borderRadius: 10, background: isUploading ? '#8A84E8' : '#5A4FE0', color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: isUploading ? 'not-allowed' : 'pointer' }}
          >
            {isUploading ? 'Uploading…' : installment.status === 'REJECTED' ? 'Re-upload proof' : 'Upload proof'}
          </button>
          <span style={{ textAlign: 'center', fontSize: 12, color: '#8D8B9C' }}>
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

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  height: 40,
  padding: '0 16px',
  border: `1px solid ${active ? '#4A41C9' : '#E1DEF2'}`,
  borderRadius: 9,
  background: active ? '#EEEDFF' : '#FFFFFF',
  color: active ? '#4A41C9' : '#45435A',
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
});

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
      <div style={{ display: 'flex', gap: 8 }}>
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setActiveTab(t.key)} style={tabBtnStyle(activeTab === t.key)}>{t.label}</button>
        ))}
      </div>

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

  const openPreview = async (item: PendingProofItemDto) => {
    setLoadingProofId(item.installmentId);
    try {
      const result = await getProofBlobUrl(item.installmentId);
      setPreview({ ...result, item });
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

  if (isLoading) return <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>Loading queue…</p>;
  if (isError) return <p style={{ margin: 0, fontSize: 14, color: '#B91C1C' }}>Failed to load queue.</p>;
  if (queue.length === 0) return <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>No proofs awaiting validation.</p>;

  return (
    <>
      {preview && (
        <div onClick={closePreview} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,10,40,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.3)', width: '100%', maxWidth: 560, overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #F0EEFA' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1F1B33' }}>{preview.item.studentName}</div>
                <div style={{ fontSize: 12.5, color: '#6B6B7B', marginTop: 3 }}>{preview.item.classGroup} · Installment {preview.item.installmentNumber} · {formatAmount(preview.item.amount)}</div>
              </div>
              <button type="button" onClick={closePreview} style={{ width: 32, height: 32, border: '1px solid #E1DEF2', borderRadius: 8, background: '#FFFFFF', color: '#45435A', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
            </div>

            {/* Proof image */}
            <div style={{ background: '#F7F6FC', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '55vh', overflow: 'auto' }}>
              {preview.type.includes('pdf')
                ? <embed src={preview.url} type="application/pdf" style={{ width: '100%', height: '55vh' }} />
                : <img src={preview.url} alt="Payment proof" style={{ display: 'block', maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain' }} />
              }
            </div>

            {/* Actions */}
            <div style={{ padding: '16px 22px', borderTop: '1px solid #F0EEFA', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rejectTargetId === preview.item.installmentId ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text" placeholder="Rejection reason…" value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)} autoFocus
                    style={{ flexGrow: 1, height: 40, boxSizing: 'border-box', border: '1px solid #F7A9A9', borderRadius: 8, padding: '0 12px', fontSize: 13.5, color: '#1F1B33', background: '#FFFFFF', outline: 'none', fontFamily: 'inherit' }}
                  />
                  <button type="button" disabled={!rejectReason.trim() || rejectingId != null} onClick={onConfirmReject} style={{ height: 40, padding: '0 14px', border: 0, borderRadius: 8, background: '#B02F2F', color: '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {rejectingId === preview.item.installmentId ? 'Rejecting…' : 'Confirm reject'}
                  </button>
                  <button type="button" onClick={onCancelReject} style={{ height: 40, padding: '0 14px', border: '1px solid #E1DEF2', borderRadius: 8, background: '#FFFFFF', color: '#45435A', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    disabled={approvingId === preview.item.installmentId || rejectingId === preview.item.installmentId}
                    onClick={() => onApprove(preview.item.installmentId)}
                    style={{ flex: 1, height: 42, border: 0, borderRadius: 10, background: '#0F8F5F', color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {approvingId === preview.item.installmentId ? 'Approving…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={approvingId === preview.item.installmentId || rejectingId === preview.item.installmentId}
                    onClick={() => onOpenReject(preview.item.installmentId)}
                    style={{ flex: 1, height: 42, border: '1px solid #F3D3D3', borderRadius: 10, background: '#FFF5F5', color: '#B02F2F', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, overflow: 'hidden' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #F0EEFA' }}>
            {['Student', 'Class group', 'Installment', 'Amount', 'Submitted', ''].map((h, i) => (
              <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12.5, fontWeight: 600, color: '#6B6B7B', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {queue.map((item) => (
            <React.Fragment key={item.installmentId}>
              <tr style={{ borderBottom: '1px solid #F5F4FA' }}>
                <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#1F1B33', fontWeight: 500 }}>{item.studentName}</td>
                <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#45435A' }}>{item.classGroup}</td>
                <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#45435A' }}>Installment {item.installmentNumber}</td>
                <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#45435A', fontWeight: 600 }}>{formatAmount(item.amount)}</td>
                <td style={{ padding: '12px 16px', fontSize: 12.5, color: '#6B6B7B' }}>{new Date(item.submittedAt).toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button type="button" disabled={loadingProofId === item.installmentId} onClick={() => openPreview(item)} style={{ height: 32, padding: '0 10px', border: '1px solid #E1DEF2', borderRadius: 7, background: '#FFFFFF', color: '#45435A', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                      {loadingProofId === item.installmentId ? 'Loading…' : 'View proof'}
                    </button>
                    <button type="button" disabled={approvingId === item.installmentId || rejectingId === item.installmentId} onClick={() => onApprove(item.installmentId)} style={{ height: 32, padding: '0 10px', border: 0, borderRadius: 7, background: '#EAFBF3', color: '#0F8F5F', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>{approvingId === item.installmentId ? 'Approving…' : 'Approve'}</button>
                    <button type="button" disabled={approvingId === item.installmentId || rejectingId === item.installmentId} onClick={() => onOpenReject(item.installmentId)} style={{ height: 32, padding: '0 10px', border: 0, borderRadius: 7, background: '#FFE8E8', color: '#B02F2F', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                  </div>
                </td>
              </tr>
              {rejectTargetId === item.installmentId && (
                <tr key={`reject-${item.installmentId}`} style={{ background: '#FEF2F2', borderBottom: '1px solid #F5F4FA' }}>
                  <td colSpan={6} style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="text" placeholder="Rejection reason…" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} autoFocus style={{ flexGrow: 1, height: 38, boxSizing: 'border-box', border: '1px solid #F7A9A9', borderRadius: 8, padding: '0 12px', fontSize: 13.5, color: '#1F1B33', background: '#FFFFFF', outline: 'none', fontFamily: 'inherit' }} />
                      <button type="button" disabled={!rejectReason.trim() || rejectingId != null} onClick={onConfirmReject} style={{ height: 38, padding: '0 12px', border: 0, borderRadius: 8, background: '#B02F2F', color: '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{rejectingId === item.installmentId ? 'Rejecting…' : 'Confirm reject'}</button>
                      <button type="button" onClick={onCancelReject} style={{ height: 38, padding: '0 12px', border: '1px solid #E1DEF2', borderRadius: 8, background: '#FFFFFF', color: '#45435A', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
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
    <select value={selectedGroupId ?? ''} onChange={(e) => onGroupChange(e.target.value ? Number(e.target.value) : undefined)} style={{ height: 42, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#1F1B33', background: '#FFFFFF', width: 240, fontFamily: 'inherit', cursor: 'pointer' }}>
      <option value="">All class groups</option>
      {classGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
    </select>
    {isLoading && <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>Loading…</p>}
    {!isLoading && overdueList.length === 0 && <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>No overdue students.</p>}
    {!isLoading && overdueList.length > 0 && (
      <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead><tr style={{ borderBottom: '1px solid #F0EEFA' }}>
            {['Student', 'Class group', 'Overdue installments'].map((h, i) => (
              <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12.5, fontWeight: 600, color: '#6B6B7B' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {overdueList.map((s) => (
              <tr key={s.studentId} style={{ borderBottom: '1px solid #F5F4FA', background: s.overdueInstallments.some((ins) => ins.status === 'UNPAID') ? '#FFFBEF' : undefined }}>
                <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#1F1B33', fontWeight: 500 }}>{s.studentName}</td>
                <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#45435A' }}>{s.classGroupName}</td>
                <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#45435A' }}>{s.overdueInstallments.map((ins) => ins.label).join(', ')}</td>
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
    groupedPlans, academicYear, classGroupId, rows, formError,
    setAcademicYear, setClassGroupId, updateRow, handleSubmit,
  } = usePlanTab(yearPlans, onCreatePlan);

  const inputStyle: React.CSSProperties = { height: 38, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 8, padding: '0 10px', fontSize: 13.5, color: '#1F1B33', background: '#FFFFFF', outline: 'none', fontFamily: 'inherit', width: '100%' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {isLoading && <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>Loading plans…</p>}
      {!isLoading && groupedPlans.length === 0 && <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>No payment plans configured yet.</p>}
      {groupedPlans.map(({ year, groups }) => (
        <div key={year} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F1B33' }}>Academic year: {year}</h3>
          {groups.map((g) => (
            <div key={g.classGroupId}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13.5, fontWeight: 600, color: '#45435A' }}>{g.classGroupName}</h4>
              <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead><tr style={{ borderBottom: '1px solid #F0EEFA' }}>
                    {['Label', 'Amount', 'Due date'].map((h, i) => <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12.5, fontWeight: 600, color: '#6B6B7B' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {g.periods.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #F5F4FA' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#1F1B33' }}>{p.label}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#1F1B33', fontWeight: 600 }}>{formatAmount(p.amount)}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#45435A' }}>{p.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F1B33' }}>Create plan</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="plan-academic-year" style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>Academic year</label>
            <input id="plan-academic-year" type="text" placeholder="e.g. 2025-2026" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={{ ...inputStyle, width: 200 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="plan-class-group" style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>Class group</label>
            <select id="plan-class-group" value={classGroupId} onChange={(e) => setClassGroupId(e.target.value)} style={{ ...inputStyle, width: 240, cursor: 'pointer' }}>
              <option value="">Select a class group</option>
              {classGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        </div>
        {rows.map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 120px 150px', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#6B6B7B', fontWeight: 600 }}>{i + 1}.</span>
            <input type="text" placeholder="Label (e.g. Installment 1)" value={row.label} onChange={(e) => updateRow(i, 'label', e.target.value)} style={inputStyle} />
            <input type="number" placeholder="Amount" min={1} value={row.amount} onChange={(e) => updateRow(i, 'amount', e.target.value)} style={inputStyle} />
            <input type="date" value={row.dueDate} onChange={(e) => updateRow(i, 'dueDate', e.target.value)} style={inputStyle} />
          </div>
        ))}
        {(formError ?? planError) && (
          <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, color: '#B91C1C' }}>{formError ?? planError}</div>
        )}
        <button type="button" disabled={isCreating} onClick={handleSubmit} style={{ alignSelf: 'flex-start', height: 40, padding: '0 18px', border: 0, borderRadius: 9, background: isCreating ? '#8A84E8' : '#5A4FE0', color: '#FFFFFF', fontSize: 13.5, fontWeight: 600, cursor: isCreating ? 'not-allowed' : 'pointer' }}>
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
      <PageHeader title="Payments" />
      <main style={{ flexGrow: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {viewType === 'student' && <StudentPaymentsView />}
        {viewType === 'admin' && <AdminPaymentsView />}
      </main>
    </>
  );
};

export default PaymentsPage;
