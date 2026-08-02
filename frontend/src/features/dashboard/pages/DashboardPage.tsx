import { NavLink } from 'react-router-dom';
import useDashboardPage from '../hooks/useDashboardPage';
import HealthStatus from '../../health/components/HealthStatus';

interface NavCard {
  to: string;
  label: string;
  description: string;
  emoji: string;
}

const STUDENT_CARDS: NavCard[] = [
  { to: '/announcements', label: 'Announcements', description: 'Department news and updates', emoji: '📢' },
  { to: '/schedule',      label: 'Calendar',      description: 'Your class schedule',         emoji: '📅' },
  { to: '/courses',       label: 'Courses',       description: 'Resources and assignments',   emoji: '📚' },
  { to: '/payments',      label: 'Payments',      description: 'Track tuition installments',  emoji: '💳' },
];

const ADMIN_CARDS: NavCard[] = [
  { to: '/admin',         label: 'Admin Console', description: 'Users, groups, and settings', emoji: '⚙️' },
  { to: '/announcements', label: 'Announcements', description: 'Post and manage notices',     emoji: '📢' },
  { to: '/timetable',     label: 'Timetable',     description: 'Manage all courses',          emoji: '🗓️' },
  { to: '/payments',      label: 'Payments',      description: 'Review payment proofs',       emoji: '💳' },
];

/**
 * Authenticated landing page — shows a greeting hero, quick-nav cards, and
 * an API health badge. All logic lives in `useDashboardPage`.
 */
const DashboardPage = () => {
  const { user, isAdmin, isTeacher } = useDashboardPage();

  const cards = (isAdmin || isTeacher) ? ADMIN_CARDS : STUDENT_CARDS;

  return (
    <div className="stack stack--lg">
      {/* Greeting hero */}
      <div
        className="card"
        style={{
          background: 'var(--gradient-brand)',
          color: 'white',
          borderColor: 'transparent',
          padding: 'var(--space-8)',
        }}
      >
        <p className="text-sm" style={{ opacity: 0.8, margin: '0 0 var(--space-1)' }}>
          Welcome back
        </p>
        <h1
          style={{
            margin: '0 0 var(--space-2)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            letterSpacing: '-0.03em',
          }}
        >
          {user?.fullName ?? 'Student'}
        </h1>
        <p style={{ margin: 0, opacity: 0.85 }}>
          {user?.role === 'ADMIN'
            ? 'Manage the department from one place.'
            : user?.role === 'TEACHER'
              ? 'Your courses, calendar, and announcements are ready.'
              : 'Announcements, schedule, resources, and payments all in one place.'}
        </p>
      </div>

      {/* Quick-nav cards */}
      <div className="grid-4">
        {cards.map(({ to, label, description, emoji }) => (
          <NavLink
            key={to}
            to={to}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <div
                className="card"
                style={{
                  cursor: 'pointer',
                  borderColor: isActive ? 'var(--color-brand-400)' : undefined,
                  background: isActive ? 'var(--color-brand-50)' : undefined,
                  transition: 'all var(--transition-fast)',
                  height: '100%',
                }}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-3)' }}>{emoji}</div>
                <p className="font-semibold text-base" style={{ margin: '0 0 var(--space-1)' }}>
                  {label}
                </p>
                <p className="text-sm text-muted" style={{ margin: 0 }}>
                  {description}
                </p>
              </div>
            )}
          </NavLink>
        ))}
      </div>

      <HealthStatus />
    </div>
  );
};

export default DashboardPage;
