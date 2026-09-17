/**
 * Past Sessions tab component rendered inside CoursePage.
 * Shows a list of past sessions with date, title, recap status badge,
 * and a "View" link to the session recap page.
 */
import { Link } from 'react-router-dom';
import usePastSessionsTab from '../hooks/usePastSessionsTab';

interface PastSessionsTabProps {
  courseId: number;
}

const PastSessionsTab = ({ courseId }: PastSessionsTabProps) => {
  const { sessions, isLoading, isError } = usePastSessionsTab(courseId);

  if (isLoading) {
    return <p className="res-resource__meta">Loading past sessions&hellip;</p>;
  }

  if (isError) {
    return <div className="alert alert--danger">Failed to load past sessions.</div>;
  }

  if (sessions.length === 0) {
    return <p className="res-resource__meta">No past sessions yet.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {sessions.map((session) => (
        <li
          key={session.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-2)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 500 }}>{session.courseName}</span>
            <span className="res-resource__meta">
              {new Date(session.sessionDate).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
            {session.hasRecap ? (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'var(--color-success, #22c55e)',
                  color: '#fff',
                }}
              >
                Has recap
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'var(--surface-3, #e5e7eb)',
                  color: 'var(--text-muted)',
                }}
              >
                No recap
              </span>
            )}

            <Link
              to={`/sessions/${session.id}/recap?courseId=${courseId}`}
              className="res-btn res-btn--sm res-btn--ghost"
            >
              View
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PastSessionsTab;
