import { Link } from 'react-router-dom';
import useDashboardPage from '../hooks/useDashboardPage';
import useStudentPayments from '../../payments/hooks/useStudentPayments';
import { academicYearOf } from '../../../utils/academicYear';
import type { InstallmentDto, InstallmentStatus } from '../../payments/types';
import type { AnnouncementDto } from '../../announcements/types';
import PageHeader from '../../../components/layout/PageHeader';

const ArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M9 12h6M12.5 9l3 3-3 3" />
  </svg>
);

const cardStyle = {
  background: 'var(--white)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-xs)',
  padding: 'var(--space-5)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--space-4)',
};

const heroButton = {
  display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, flexShrink: 0, padding: '0 16px',
  borderRadius: 'var(--radius-md)', background: 'var(--white)', color: 'var(--orange-700)',
  fontSize: 14, fontWeight: 600, textDecoration: 'none',
};

// ── Latest announcements ─────────────────────────────────────────────────────

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const AnnouncementRow = ({ item }: { item: AnnouncementDto }) => (
  <li>
    <Link
      to={`/announcements/${item.id}`}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', textDecoration: 'none', color: 'inherit', borderTop: '1px solid var(--border)' }}
    >
      <span style={{ width: 8, height: 8, flexShrink: 0, borderRadius: 'var(--radius-full)', background: item.read ? 'transparent' : 'var(--orange-500)' }} aria-hidden="true" />
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: item.read ? 500 : 600, color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </span>
        <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>
          {item.authorName} · {item.classGroupName ?? 'Department'} · {formatDay(item.createdAt)}
        </span>
      </span>
      {item.urgent && <span className="badge badge--danger">Urgent</span>}
      {!item.read && <span className="sr-only">Unread</span>}
    </Link>
  </li>
);

const LatestAnnouncements = ({ items, isLoading }: { items: AnnouncementDto[]; isLoading: boolean }) => (
  <section style={cardStyle} aria-labelledby="dash-ann-title">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <h2 id="dash-ann-title" className="section-title" style={{ fontSize: 16, lineHeight: '24px' }}>Latest announcements</h2>
      <Link to="/announcements" className="btn btn--link">View all <ArrowRight /></Link>
    </div>
    {isLoading && <div className="skeleton" style={{ height: 160 }} />}
    {!isLoading && items.length === 0 && (
      <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-500)' }}>No announcements yet.</p>
    )}
    {!isLoading && items.length > 0 && (
      <ul style={{ listStyle: 'none', margin: '-12px 0 -12px', padding: 0 }}>
        {items.map((item) => <AnnouncementRow key={item.id} item={item} />)}
      </ul>
    )}
  </section>
);

// ── Tuition progress (students) ──────────────────────────────────────────────

const STATUS_BADGE: Record<InstallmentStatus, { cls: string; label: string }> = {
  LOCKED:          { cls: 'badge--neutral', label: 'Locked' },
  UNPAID:          { cls: 'badge--warning', label: 'Unpaid' },
  PROOF_SUBMITTED: { cls: 'badge--neutral', label: 'In review' },
  PAID:            { cls: 'badge--success', label: 'Paid' },
  REJECTED:        { cls: 'badge--danger',  label: 'Rejected' },
};

const InstallmentRow = ({ inst }: { inst: InstallmentDto }) => {
  const badge = STATUS_BADGE[inst.status];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: inst.status === 'LOCKED' ? 'var(--ink-500)' : 'var(--ink-900)' }}>{inst.label}</span>
        <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>
          Due {formatDay(inst.dueDate)}
          {inst.overdue && inst.status !== 'PAID' && <span style={{ color: 'var(--danger-700)', fontWeight: 600 }}> · Overdue</span>}
        </span>
      </span>
      <span className={`badge ${badge.cls}`}>{badge.label}</span>
    </div>
  );
};

const PaymentPanel = () => {
  const { installments, isLoading } = useStudentPayments();
  const paid = installments.filter((i) => i.status === 'PAID').length;
  const total = installments.length;
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
  const unpaid = installments.find((i) => i.status === 'UNPAID' || i.status === 'REJECTED');

  return (
    <section style={cardStyle} aria-labelledby="dash-pay-title">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <h2 id="dash-pay-title" style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>Tuition progress</h2>
        <span className="overline">{academicYearOf(new Date())}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 20, lineHeight: '28px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>{paid}/{total}</span>
          <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>installments paid</span>
        </div>
        <div className="progress" role="progressbar" aria-valuenow={paid} aria-valuemin={0} aria-valuemax={total} aria-label="Installments paid">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      {isLoading ? (
        <div className="skeleton" style={{ height: 120 }} />
      ) : installments.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-500)' }}>No payment plan for your class group yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {installments.map((inst) => <InstallmentRow key={inst.id} inst={inst} />)}
        </div>
      )}

      {unpaid && (
        <Link to="/payments" className="btn btn--primary" style={{ width: '100%' }}>
          Upload proof for {unpaid.label.toLowerCase()}
        </Link>
      )}
      <p style={{ margin: 0, fontSize: 12, lineHeight: '16px', color: 'var(--ink-500)' }}>
        Proof can be a JPEG, PNG or PDF of your bank receipt. The office reviews it and the status updates here.
      </p>
    </section>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const DashboardPage = () => {
  const { user, isAdmin, isTeacher, nextSession, pendingProofCount, latestAnnouncements, announcementsLoading } = useDashboardPage();
  const isStudent = !isAdmin && !isTeacher;
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      <PageHeader title="Dashboard" subtitle={today} />

      <div className="page-body">
        <div className={isStudent ? 'dashboard-layout' : undefined}>
          <div className="dashboard-main">
            {/* Hero */}
            <section
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 'var(--radius-xl)',
                padding: '28px 32px',
                background: 'var(--orange-900)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
            >
              <div style={{ position: 'absolute', top: -120, right: -90, width: 340, height: 340, borderRadius: 'var(--radius-full)', background: 'radial-gradient(circle, rgba(255, 107, 31, 0.55) 0%, rgba(255, 107, 31, 0) 70%)' }} aria-hidden="true" />
              <h2 style={{ position: 'relative', margin: 0, fontSize: 24, lineHeight: '32px', fontWeight: 600, color: 'var(--white)', letterSpacing: '-0.01em' }}>
                {getGreeting()}, {firstName}
              </h2>

              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  background: 'rgba(255, 255, 255, 0.12)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 18px',
                }}
              >
                {isStudent ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                      <span className="overline" style={{ color: 'var(--orange-100)' }}>Next session</span>
                      <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)' }}>
                        {nextSession
                          ? `${nextSession.courseName} · ${new Date(nextSession.sessionDate).toLocaleDateString('en-US', { weekday: 'long' })} ${nextSession.startTime.slice(0, 5)}–${nextSession.endTime.slice(0, 5)}${nextSession.room ? ` · Room ${nextSession.room}` : ''}`
                          : 'No upcoming sessions'}
                      </span>
                    </div>
                    {nextSession?.meetUrl ? (
                      <a href={nextSession.meetUrl} target="_blank" rel="noopener noreferrer" style={heroButton}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="2.5" y="6" width="13" height="12" rx="2.5" /><path d="m15.5 10.5 6-3.2v9.4l-6-3.2" />
                        </svg>
                        Join Meet
                      </a>
                    ) : (
                      <Link to="/schedule" style={heroButton}>View calendar</Link>
                    )}
                  </>
                ) : pendingProofCount > 0 ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                      <span className="overline" style={{ color: 'var(--orange-100)' }}>Needs you</span>
                      <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)' }}>
                        {pendingProofCount} payment proof{pendingProofCount !== 1 ? 's' : ''} waiting for review
                      </span>
                    </div>
                    <Link to="/payments" style={heroButton}>Review proofs</Link>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    <span className="overline" style={{ color: 'var(--orange-100)' }}>All clear</span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)' }}>No payment proofs pending review</span>
                  </div>
                )}
              </div>
            </section>

            <LatestAnnouncements items={latestAnnouncements} isLoading={announcementsLoading} />
          </div>

          {isStudent && (
            <aside className="dashboard-aside">
              <PaymentPanel />
            </aside>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
