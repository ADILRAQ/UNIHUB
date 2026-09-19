import type { ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import useDashboardPage from '../hooks/useDashboardPage';
import useStudentPayments from '../../payments/hooks/useStudentPayments';
import type { InstallmentDto, InstallmentStatus } from '../../payments/types';
import PageHeader from '../../../components/layout/PageHeader';

// ── Shared small components ───────────────────────────────────────────────────

const ArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
  </svg>
);

// ── Nav card ──────────────────────────────────────────────────────────────────

interface NavCardDef {
  to: string;
  label: string;
  description: string;
  iconBg: string;
  iconColor: string;
  icon: ReactNode;
}

const NavCard = ({ to, label, description, iconBg, iconColor, icon }: NavCardDef) => (
  <NavLink to={to} style={{ textDecoration: 'none' }}>
    <div
      style={{
        height: 190,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#FFFFFF',
        border: '1px solid #EDEBF8',
        borderRadius: 16,
        padding: '22px 24px',
        boxShadow: '0 1px 2px rgba(108,99,255,0.05), 0 8px 22px rgba(108,99,255,0.06)',
        cursor: 'pointer',
      }}
    >
      <span style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1F1B33', letterSpacing: '-0.01em' }}>{label}</span>
        <span style={{ fontSize: 13.5, lineHeight: 1.5, color: '#6B6B7B' }}>{description}</span>
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#4A41C9' }}>
        Open <ArrowRight />
      </span>
    </div>
  </NavLink>
);

// ── Student nav cards ─────────────────────────────────────────────────────────

const STUDENT_CARDS: NavCardDef[] = [
  {
    to: '/announcements',
    label: 'Announcements',
    description: 'Department notices for your class group',
    iconBg: '#EEEDFF', iconColor: '#4A41C9',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 10.2v3.6a1.2 1.2 0 0 0 1.2 1.2h2.1L13 19V5l-6.2 4H4.7a1.2 1.2 0 0 0-1.2 1.2Z"/>
        <path d="M17.5 8.6a4.6 4.6 0 0 1 0 6.8"/>
      </svg>
    ),
  },
  {
    to: '/schedule',
    label: 'Calendar',
    description: 'Today, week and month views of your sessions',
    iconBg: '#EEEDFF', iconColor: '#4A41C9',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2.5"/>
        <path d="M3 10h18M8 3v4M16 3v4"/>
      </svg>
    ),
  },
  {
    to: '/courses',
    label: 'Courses',
    description: 'Modules, resources and assignment submissions',
    iconBg: '#EEEDFF', iconColor: '#4A41C9',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>
      </svg>
    ),
  },
  {
    to: '/payments',
    label: 'Payments',
    description: 'Track your three tuition installments',
    iconBg: '#FFF1F1', iconColor: '#C23B3B',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="5" width="19" height="14" rx="2.5"/>
        <path d="M2.5 10h19"/>
      </svg>
    ),
  },
];

const ADMIN_CARDS: NavCardDef[] = [
  {
    to: '/admin',
    label: 'Admin console',
    description: 'Users, class groups and CSV bulk import',
    iconBg: '#EEEDFF', iconColor: '#4A41C9',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.6 20 5.6v5.9c0 4.9-3.3 8.5-8 9.9-4.7-1.4-8-5-8-9.9V5.6l8-3Z"/>
      </svg>
    ),
  },
  {
    to: '/announcements',
    label: 'Announcements',
    description: 'Post to one class group or the whole department',
    iconBg: '#EEEDFF', iconColor: '#4A41C9',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 10.2v3.6a1.2 1.2 0 0 0 1.2 1.2h2.1L13 19V5l-6.2 4H4.7a1.2 1.2 0 0 0-1.2 1.2Z"/>
        <path d="M17.5 8.6a4.6 4.6 0 0 1 0 6.8"/>
      </svg>
    ),
  },
  {
    to: '/timetable',
    label: 'Timetable',
    description: 'Weekly templates, then generate the sessions',
    iconBg: '#EEEDFF', iconColor: '#4A41C9',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/>
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>
        <path d="M7.5 13.5h3M13.5 13.5h3M7.5 17.5h3"/>
      </svg>
    ),
  },
  {
    to: '/payments',
    label: 'Payments',
    description: '7 proofs pending · overdue list · year plan setup',
    iconBg: '#FFF1F1', iconColor: '#C23B3B',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="5" width="19" height="14" rx="2.5"/>
        <path d="M2.5 10h19"/>
      </svg>
    ),
  },
];

// ── Payment panel ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<InstallmentStatus, { dot: string; badge: string; badgeText: string; label: string }> = {
  LOCKED:          { dot: '#B9B7C9', badge: '#F1F0F6', badgeText: '#5C5A6E', label: 'Locked' },
  UNPAID:          { dot: '#F59E0B', badge: '#FEF3C7', badgeText: '#92400E', label: 'Unpaid' },
  PROOF_SUBMITTED: { dot: '#6C63FF', badge: '#EEEDFF', badgeText: '#4A41C9', label: 'Under review' },
  PAID:            { dot: '#10B981', badge: '#D1FAE5', badgeText: '#047857', label: 'Paid' },
  REJECTED:        { dot: '#EF4444', badge: '#FEE2E2', badgeText: '#991B1B', label: 'Rejected' },
};

const InstallmentRow = ({ inst }: { inst: InstallmentDto }) => {
  const cfg = STATUS_CONFIG[inst.status];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 9, height: 9, flexShrink: 0, borderRadius: '50%', background: cfg.dot }} />
      <span style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: inst.status === 'LOCKED' ? '#6B6B7B' : '#1F1B33' }}>{inst.label}</span>
        <span style={{ fontSize: 12, color: '#6B6B7B' }}>
          Due {new Date(inst.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          {inst.overdue && inst.status !== 'PAID' && <span style={{ color: '#EF4444', marginLeft: 4 }}>· Overdue</span>}
        </span>
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 9px', borderRadius: 999, background: cfg.badge, color: cfg.badgeText, fontSize: 11.5, fontWeight: 600 }}>
        {cfg.label}
      </span>
    </div>
  );
};

const PaymentPanel = () => {
  const { installments, isLoading } = useStudentPayments();
  const paid = installments.filter(i => i.status === 'PAID').length;
  const total = installments.length;
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
  const r = 64;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;
  const unpaid = installments.find(i => i.status === 'UNPAID');

  return (
    <section
      style={{
        flexGrow: 1,
        boxSizing: 'border-box',
        background: '#FFFFFF',
        border: '1px solid #EDEBF8',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 1px 2px rgba(108,99,255,0.05), 0 8px 22px rgba(108,99,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F1B33' }}>Tuition progress</h3>
        <span style={{ fontSize: 12.5, color: '#6B6B7B' }}>2026–2027</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 168, height: 168 }}>
          <svg width="168" height="168" viewBox="0 0 168 168">
            <circle cx="84" cy="84" r={r} fill="none" stroke="#F0EEFB" strokeWidth="18" />
            <circle
              cx="84" cy="84" r={r} fill="none"
              stroke="#10B981" strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 84 84)"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 168, height: 168, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: '#1F1B33', letterSpacing: '-0.02em' }}>{pct}%</span>
            <span style={{ fontSize: 12.5, color: '#6B6B7B' }}>{paid} of {total} paid</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ height: 80, borderRadius: 10, background: '#F1F0F6', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {installments.map(inst => <InstallmentRow key={inst.id} inst={inst} />)}
          {installments.length === 0 && (
            <p style={{ margin: 0, fontSize: 13.5, color: '#6B6B7B', textAlign: 'center' }}>No payment periods configured yet.</p>
          )}
        </div>
      )}

      {unpaid && (
        <Link
          to="/payments"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, border: 0, borderRadius: 10, background: '#5A4FE0', color: '#FFFFFF', fontSize: 14.5, fontWeight: 600, textDecoration: 'none' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16.5V4.5"/><path d="m7.5 9 4.5-4.5L16.5 9"/>
            <path d="M4.5 16v2.5A2.5 2.5 0 0 0 7 21h10a2.5 2.5 0 0 0 2.5-2.5V16"/>
          </svg>
          Upload proof for {unpaid.label.toLowerCase()}
        </Link>
      )}
    </section>
  );
};

// ── Quick info panel (admin/teacher) ──────────────────────────────────────────

const QuickInfoPanel = () => (
  <aside
    style={{
      width: 340,
      flexShrink: 0,
      boxSizing: 'border-box',
      background: '#FFFFFF',
      border: '1px solid #EDEBF8',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 1px 2px rgba(108,99,255,0.05), 0 8px 22px rgba(108,99,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: '#EEEDFF', color: '#4A41C9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 18.5h5M10.5 21.5h3"/>
          <path d="M12 2.8a6.2 6.2 0 0 0-3.6 11.3c.6.5.9 1.1 1 1.6v.3h5.2v-.3c.1-.5.4-1.1 1-1.6A6.2 6.2 0 0 0 12 2.8Z"/>
        </svg>
      </span>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F1B33' }}>Quick info</h3>
    </div>
    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: '#45435A' }}>
      Use the sidebar to navigate to courses, timetable, and management tools. The sections above are your most-used shortcuts.
    </p>
  </aside>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const DashboardPage = () => {
  const { user, isAdmin, isTeacher } = useDashboardPage();
  const isStudent = !isAdmin && !isTeacher;
  const cards = isStudent ? STUDENT_CARDS : ADMIN_CARDS;
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const headerActions = (isAdmin || isTeacher) ? (
    <Link
      to="/announcements/new"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px', borderRadius: 10, background: '#5A4FE0', color: '#FFFFFF', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5.5v13M5.5 12h13"/>
      </svg>
      New announcement
    </Link>
  ) : null;

  return (
    <>
      <PageHeader title="Dashboard" actions={headerActions} />

      <main style={{ flexGrow: 1, boxSizing: 'border-box', padding: '36px 32px', display: 'flex', gap: 28, alignItems: 'stretch', minHeight: 0 }}>
        {/* Left column */}
        <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Hero gradient */}
          <section
            style={{
              position: 'relative',
              overflow: 'hidden',
              height: 220,
              flexShrink: 0,
              boxSizing: 'border-box',
              borderRadius: 20,
              padding: '28px 32px',
              background: 'linear-gradient(120deg, #3F37B8 0%, #4A41C9 42%, #6156E6 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ position: 'absolute', top: -120, right: -90, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 68%)' }} />
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.025em' }}>
                {getGreeting()}, {firstName}
              </h2>
              <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>{today}</p>
            </div>
            {/* Frosted info block */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                background: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: 14,
                padding: '14px 18px',
              }}
            >
              {isStudent ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#FFFFFF' }}>NEXT SESSION</span>
                    <span style={{ fontSize: 15.5, fontWeight: 600, color: '#FFFFFF' }}>Check your calendar for upcoming sessions</span>
                  </div>
                  <Link
                    to="/schedule"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, flexShrink: 0, padding: '0 16px', borderRadius: 10, background: '#FFFFFF', color: '#4A41C9', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2.5" y="6" width="13" height="12" rx="2.5"/>
                      <path d="m15.5 10.5 6-3.2v9.4l-6-3.2"/>
                    </svg>
                    View calendar
                  </Link>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#FFFFFF' }}>NEEDS YOU</span>
                    <span style={{ fontSize: 15.5, fontWeight: 600, color: '#FFFFFF' }}>Payment proofs and session recaps are waiting for review</span>
                  </div>
                  <Link
                    to="/payments"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, flexShrink: 0, padding: '0 16px', borderRadius: 10, background: '#FFFFFF', color: '#4A41C9', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
                  >
                    Review proofs
                    <ArrowRight />
                  </Link>
                </>
              )}
            </div>
          </section>

          {/* 2×2 nav cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 }}>
            {cards.map(c => <NavCard key={c.to} {...c} />)}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {isStudent ? (
            <>
              <PaymentPanel />
              <section style={{ flexShrink: 0, boxSizing: 'border-box', background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 12 }}>
                <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: '#EEEDFF', color: '#4A41C9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 18.5h5M10.5 21.5h3"/>
                    <path d="M12 2.8a6.2 6.2 0 0 0-3.6 11.3c.6.5.9 1.1 1 1.6v.3h5.2v-.3c.1-.5.4-1.1 1-1.6A6.2 6.2 0 0 0 12 2.8Z"/>
                  </svg>
                </span>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: '#55536B' }}>Proof can be a JPEG, PNG or PDF of your bank receipt. The office reviews it and the status updates here.</p>
              </section>
            </>
          ) : (
            <QuickInfoPanel />
          )}
        </div>
      </main>
    </>
  );
};

export default DashboardPage;
