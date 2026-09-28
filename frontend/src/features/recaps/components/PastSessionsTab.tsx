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
    return <div className="skeleton" style={{ height: 120 }} />;
  }

  if (isError) {
    return <div className="alert" role="alert">Failed to load past sessions.</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="empty-state__title">No past sessions yet</h2>
        <p className="empty-state__body">Once a class has taken place, its recording, notes and resources show up here.</p>
      </div>
    );
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
            borderRadius: 'var(--radius-lg)',
            background: 'var(--cream-100)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>
              {new Date(session.sessionDate).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
            {session.hasRecap ? (
              <span className="badge badge--success">
                Has recap
              </span>
            ) : (
              <span className="badge badge--neutral">
                No recap
              </span>
            )}

            <Link
              to={`/sessions/${session.id}/recap?courseId=${courseId}`}
              className="btn btn--sm"
            >
              Open recap
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PastSessionsTab;
