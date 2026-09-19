import React, { useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import useStudentPayments from '../hooks/useStudentPayments';
import useAdminPayments from '../hooks/useAdminPayments';
import PageHeader from '../../../components/layout/PageHeader';
import type { InstallmentDto, CreatePeriodEntry } from '../types';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {installments.map((ins) => {
        const canUpload = ins.status === 'UNPAID' || ins.status === 'REJECTED';
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

const InstallmentCard = ({ installment, isUploading, feedback, canUpload, onUpload }: InstallmentCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 2px rgba(108,99,255,0.05)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1F1B33' }}>{installment.label}</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#1F1B33', letterSpacing: '-0.02em' }}>{formatAmount(installment.amount)}</span>
          <span style={{ fontSize: 12.5, color: '#6B6B7B' }}>Due: {installment.dueDate}</span>
          {installment.status !== 'PAID' && installment.status !== 'LOCKED' && (
            <span style={{ fontSize: 12, color: installment.overdue ? '#B02F2F' : '#6B6B7B' }}>{daysLabel(installment.dueDate)}</span>
          )}
        </div>
        {badge(installment.status)}
      </div>

      {installment.status === 'REJECTED' && installment.rejectionReason && (
        <div style={{ background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#B91C1C' }}>
          Rejection reason: {installment.rejectionReason}
        </div>
      )}

      {canUpload && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 14px', border: 0, borderRadius: 9, background: isUploading ? '#8A84E8' : '#5A4FE0', color: '#FFFFFF', fontSize: 13.5, fontWeight: 600, cursor: isUploading ? 'not-allowed' : 'pointer' }}
          >
            {isUploading ? 'Uploading…' : installment.status === 'REJECTED' ? 'Re-upload proof' : 'Upload proof'}
          </button>
          {feedback && <span style={{ fontSize: 12.5, color: '#6B6B7B' }}>{feedback}</span>}
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
    openReject, cancelReject, approveItem, confirmReject, downloadProof,
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
          onCancelReject={cancelReject} onConfirmReject={confirmReject}
          onDownloadProof={downloadProof} />
      )}
      {activeTab === 'overdue' && (
        <OverdueTab overdueList={overdueList} isLoading={isLoadingOverdue}
          classGroups={classGroups} selectedGroupId={selectedGroupId}
          onGroupChange={setSelectedGroupId} />
      )}
      {activeTab === 'plan' && (
        <PlanTab yearPlans={yearPlans} isLoading={isLoadingPlans}
          onCreatePlan={createYearPlan} isCreating={isCreatingPlan} planError={planError} />
      )}
    </div>
  );
};

/* ── Queue tab ─────────────────────────────────────────────────────── */

interface QueueTabProps {
  queue: ReturnType<typeof useAdminPayments>['queue'];
  isLoading: boolean; isError: boolean;
  approvingId: number | null; rejectingId: number | null;
  rejectTargetId: number | null; rejectReason: string;
  setRejectReason: (v: string) => void;
  onApprove: (id: number) => void; onOpenReject: (id: number) => void;
  onCancelReject: () => void; onConfirmReject: () => void;
  onDownloadProof: (id: number, filename: string) => Promise<void>;
}

const QueueTab = ({ queue, isLoading, isError, approvingId, rejectingId, rejectTargetId, rejectReason, setRejectReason, onApprove, onOpenReject, onCancelReject, onConfirmReject, onDownloadProof }: QueueTabProps) => {
  if (isLoading) return <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>Loading queue…</p>;
  if (isError) return <p style={{ margin: 0, fontSize: 14, color: '#B91C1C' }}>Failed to load queue.</p>;
  if (queue.length === 0) return <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>No proofs awaiting validation.</p>;

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, overflow: 'hidden' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #F0EEFA' }}>
            {['Student', 'Class group', 'Installment', 'Amount', 'Due date', 'Submitted', ''].map((h, i) => (
              <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12.5, fontWeight: 600, color: '#6B6B7B', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {queue.map((item) => (
            <React.Fragment key={item.installmentId}>
              <tr style={{ borderBottom: '1px solid #F5F4FA' }}>
                <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#1F1B33', fontWeight: 500 }}>{item.studentName}</td>
                <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#45435A' }}>{item.classGroupName}</td>
                <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#45435A' }}>{item.label}</td>
                <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#45435A', fontWeight: 600 }}>{formatAmount(item.amount)}</td>
                <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#45435A' }}>{item.dueDate}</td>
                <td style={{ padding: '12px 16px', fontSize: 12.5, color: '#6B6B7B' }}>{new Date(item.submittedAt).toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => onDownloadProof(item.installmentId, `proof-${item.studentName}-${item.label}`)} style={{ height: 32, padding: '0 10px', border: '1px solid #E1DEF2', borderRadius: 7, background: '#FFFFFF', color: '#45435A', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>View proof</button>
                    <button type="button" disabled={approvingId === item.installmentId || rejectingId === item.installmentId} onClick={() => onApprove(item.installmentId)} style={{ height: 32, padding: '0 10px', border: 0, borderRadius: 7, background: '#EAFBF3', color: '#0F8F5F', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>{approvingId === item.installmentId ? 'Approving…' : 'Approve'}</button>
                    <button type="button" disabled={approvingId === item.installmentId || rejectingId === item.installmentId} onClick={() => onOpenReject(item.installmentId)} style={{ height: 32, padding: '0 10px', border: 0, borderRadius: 7, background: '#FFE8E8', color: '#B02F2F', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                  </div>
                </td>
              </tr>
              {rejectTargetId === item.installmentId && (
                <tr key={`reject-${item.installmentId}`} style={{ background: '#FEF2F2', borderBottom: '1px solid #F5F4FA' }}>
                  <td colSpan={7} style={{ padding: '12px 16px' }}>
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
  );
};

/* ── Overdue tab ─────────────────────────────────────────────────────── */

interface OverdueTabProps {
  overdueList: ReturnType<typeof useAdminPayments>['overdueList'];
  isLoading: boolean;
  classGroups: ReturnType<typeof useAdminPayments>['classGroups'];
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

const EMPTY_ROW = (): { label: string; amount: string; dueDate: string } => ({ label: '', amount: '', dueDate: '' });

interface PlanTabProps {
  yearPlans: Record<string, ReturnType<typeof useAdminPayments>['yearPlans'][string]>;
  isLoading: boolean;
  onCreatePlan: (data: { academicYear: string; periods: CreatePeriodEntry[] }) => void;
  isCreating: boolean;
  planError: string | null;
}

const PlanTab = ({ yearPlans, isLoading, onCreatePlan, isCreating, planError }: PlanTabProps) => {
  const [academicYear, setAcademicYear] = useState('');
  const [rows, setRows] = useState([EMPTY_ROW(), EMPTY_ROW(), EMPTY_ROW()]);
  const [formError, setFormError] = useState<string | null>(null);

  const updateRow = (index: number, field: 'label' | 'amount' | 'dueDate', value: string) => {
    setRows((prev) => { const next = [...prev]; next[index] = { ...next[index], [field]: value }; return next; });
  };

  const handleSubmit = () => {
    setFormError(null);
    if (!academicYear.trim()) { setFormError('Academic year is required.'); return; }
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.label.trim() || !row.amount || !row.dueDate) { setFormError(`Row ${i + 1}: all fields are required.`); return; }
      if (Number(row.amount) <= 0) { setFormError(`Row ${i + 1}: amount must be greater than 0.`); return; }
    }
    if (rows[0].dueDate >= rows[1].dueDate || rows[1].dueDate >= rows[2].dueDate) { setFormError('Due dates must be in order: 1 < 2 < 3.'); return; }
    onCreatePlan({ academicYear: academicYear.trim(), periods: rows.map((row, i) => ({ label: row.label.trim(), amount: Number(row.amount), dueDate: row.dueDate, periodOrder: i + 1 })) });
  };

  const inputStyle: React.CSSProperties = { height: 38, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 8, padding: '0 10px', fontSize: 13.5, color: '#1F1B33', background: '#FFFFFF', outline: 'none', fontFamily: 'inherit', width: '100%' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {isLoading && <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>Loading plans…</p>}
      {!isLoading && Object.keys(yearPlans).length === 0 && <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>No year plans configured yet.</p>}
      {Object.entries(yearPlans).map(([year, periods]) => (
        <div key={year}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#1F1B33' }}>Academic year: {year}</h3>
          <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead><tr style={{ borderBottom: '1px solid #F0EEFA' }}>
                {['Label', 'Amount', 'Due date'].map((h, i) => <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12.5, fontWeight: 600, color: '#6B6B7B' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {periods.map((p) => (
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

      <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F1B33' }}>Create new year plan</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>Academic year</label>
          <input type="text" placeholder="e.g. 2025-2026" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={{ ...inputStyle, width: 200 }} />
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
          {isCreating ? 'Creating…' : 'Create year plan'}
        </button>
      </div>
    </div>
  );
};

/* ── Root page ───────────────────────────────────────────────────────── */

const PaymentsPage = () => {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Payments" />
      <main style={{ flexGrow: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {user?.role === 'STUDENT' && <StudentPaymentsView />}
        {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && <AdminPaymentsView />}
      </main>
    </>
  );
};

export default PaymentsPage;
