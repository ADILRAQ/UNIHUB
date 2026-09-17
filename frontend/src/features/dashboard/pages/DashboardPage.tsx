import { NavLink } from 'react-router-dom';
import useDashboardPage from '../hooks/useDashboardPage';
import useStudentPayments from '../../payments/hooks/useStudentPayments';
import type { InstallmentDto, InstallmentStatus } from '../../payments/types';

// ── Nav cards ───────────────────────────────────────────────────────────────

interface NavCard { to: string; label: string; description: string; color: string; emoji: string; }

const STUDENT_CARDS: NavCard[] = [
  { to: '/announcements', label: 'Announcements', description: 'Department news',        color: 'var(--color-brand-500)', emoji: '📢' },
  { to: '/schedule',      label: 'Calendar',      description: 'Class schedule',          color: '#7c3aed',               emoji: '📅' },
  { to: '/courses',       label: 'Courses',       description: 'Resources & assignments', color: '#059669',               emoji: '📚' },
  { to: '/payments',      label: 'Payments',      description: 'Tuition installments',    color: '#d97706',               emoji: '💳' },
];

const ADMIN_CARDS: NavCard[] = [
  { to: '/admin',         label: 'Admin Console', description: 'Users & groups',          color: 'var(--color-brand-500)', emoji: '⚙️' },
  { to: '/announcements', label: 'Announcements', description: 'Post & manage notices',   color: '#7c3aed',                emoji: '📢' },
  { to: '/timetable',     label: 'Timetable',     description: 'All courses & schedules', color: '#059669',                emoji: '🗓️' },
  { to: '/payments',      label: 'Payments',      description: 'Review payment proofs',   color: '#d97706',                emoji: '💳' },
];

// ── Payment panel (student only) ─────────────────────────────────────────────

const STATUS_LABEL: Record<InstallmentStatus, string> = {
  LOCKED:           'Locked',
  UNPAID:           'Unpaid',
  PROOF_SUBMITTED:  'Under review',
  PAID:             'Paid',
  REJECTED:         'Rejected',
};

const STATUS_COLOR: Record<InstallmentStatus, string> = {
  LOCKED:           'var(--color-neutral-300)',
  UNPAID:           'var(--color-warning)',
  PROOF_SUBMITTED:  'var(--color-info)',
  PAID:             'var(--color-success)',
  REJECTED:         'var(--color-danger)',
};

const InstallmentRow = ({ inst }: { inst: InstallmentDto }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-subtle)' }}>
    <div style={{
      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
      background: STATUS_COLOR[inst.status],
    }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>{inst.label}</p>
      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
        Due {new Date(inst.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        {inst.overdue && inst.status !== 'PAID' && <span style={{ color: 'var(--color-danger)', marginLeft: 4 }}>· Overdue</span>}
      </p>
    </div>
    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color: STATUS_COLOR[inst.status] }}>
      {STATUS_LABEL[inst.status]}
    </span>
  </div>
);

const PaymentPanel = () => {
  const { installments, isLoading } = useStudentPayments();
  const paid = installments.filter(i => i.status === 'PAID').length;
  const total = installments.length;
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
  const circumference = 2 * Math.PI * 38;
  const dash = (pct / 100) * circumference;

  return (
    <div className="card" style={{ height: 'fit-content' }}>
      <p className="font-semibold text-base" style={{ margin: '0 0 var(--space-4)' }}>Payments</p>

      {/* Donut */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" fill="none" stroke="var(--border-subtle)" strokeWidth="10"/>
          <circle
            cx="50" cy="50" r="38" fill="none"
            stroke="var(--color-brand-500)" strokeWidth="10"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: 18, fontWeight: 700, fill: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
            {pct}%
          </text>
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)' }}>{paid}</p>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Paid</p>
        </div>
        <div style={{ width: 1, background: 'var(--border-subtle)' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)' }}>{total - paid}</p>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Remaining</p>
        </div>
      </div>

      {isLoading ? (
        <div className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-md)' }} />
      ) : (
        <div>
          {installments.map(inst => <InstallmentRow key={inst.id} inst={inst} />)}
          {installments.length === 0 && (
            <p className="text-sm text-muted" style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
              No payment periods yet.
            </p>
          )}
        </div>
      )}

      <NavLink to="/payments" style={{ display: 'block', marginTop: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-brand-600)', fontWeight: 'var(--font-weight-medium)', textDecoration: 'none' }}>
        View all →
      </NavLink>
    </div>
  );
};

// ── Main page ────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const { user, isAdmin, isTeacher } = useDashboardPage();
  const isStudent = !isAdmin && !isTeacher;
  const cards = (isAdmin || isTeacher) ? ADMIN_CARDS : STUDENT_CARDS;

  const roleSubtitle = isAdmin
    ? 'Manage the department from one place.'
    : isTeacher
      ? 'Your courses, calendar, and announcements are ready.'
      : 'Announcements, schedule, resources, and payments — all in one place.';

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        {/* Greeting hero */}
        <div className="dashboard-hero card" style={{ background: 'var(--gradient-brand)', color: 'white', borderColor: 'transparent' }}>
          <p style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-sm)', opacity: 0.75 }}>Welcome back</p>
          <h1 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', letterSpacing: '-0.03em' }}>
            Hello, {user?.fullName ?? 'there'}!
          </h1>
          <p style={{ margin: 0, opacity: 0.85, fontSize: 'var(--text-sm)' }}>{roleSubtitle}</p>
        </div>

        {/* Quick-nav cards */}
        <div className="grid-4">
          {cards.map(({ to, label, description, color, emoji }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div
                  className="card card--interactive"
                  style={{
                    cursor: 'pointer',
                    borderTop: `3px solid ${color}`,
                    background: isActive ? 'var(--color-brand-50)' : undefined,
                    height: '100%',
                  }}
                >
                  <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-3)' }}>{emoji}</div>
                  <p className="font-semibold text-base" style={{ margin: '0 0 var(--space-1)' }}>{label}</p>
                  <p className="text-sm text-muted" style={{ margin: 0 }}>{description}</p>
                  <p style={{ margin: 'var(--space-3) 0 0', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color }}>
                    Open →
                  </p>
                </div>
              )}
            </NavLink>
          ))}
        </div>

      </div>

      {/* Right panel */}
      <aside className="dashboard-aside">
        {isStudent ? (
          <PaymentPanel />
        ) : (
          <div className="card">
            <p className="font-semibold text-base" style={{ margin: '0 0 var(--space-3)' }}>Quick info</p>
            <p className="text-sm text-muted" style={{ margin: 0 }}>
              Use the sidebar to navigate to your courses, timetable, and management tools.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default DashboardPage;
