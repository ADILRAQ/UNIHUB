/**
 * Session recap view page (all authenticated roles).
 *
 * Students/teachers see the recording link, rich-text notes, linked resources
 * (with download), and linked assignment links back to the course page.
 * Teachers/admins also see an "Edit Recap" link.
 *
 * The `courseId` query param is forwarded from the CoursePage past-sessions list
 * and is used to build the "Edit Recap" link and the assignment course links.
 */
import { Link } from 'react-router-dom';
import useSessionRecapPage from '../hooks/useSessionRecapPage';
import { downloadResource } from '../../resources/services/resourceService';

const SessionRecapPage = () => {
  const { recap, isLoading, isError, sessionId, courseId, canEdit } = useSessionRecapPage();

  if (isLoading) {
    return (
      <div className="res-page">
        <p className="res-resource__meta">Loading recap&hellip;</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="res-page">
        <div className="alert alert--danger">Failed to load session recap. Please try again.</div>
      </div>
    );
  }

  const courseQuery = courseId ? `?courseId=${courseId}` : '';

  return (
    <div className="res-page">
      <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {courseId ? (
          <Link to={`/courses/${courseId}`} className="res-btn res-btn--ghost">
            &larr; Back to course
          </Link>
        ) : (
          <Link to="/courses" className="res-btn res-btn--ghost">
            &larr; Back to courses
          </Link>
        )}

        {canEdit && (
          <Link
            to={`/sessions/${sessionId}/recap/edit${courseQuery}`}
            className="res-btn res-btn--primary"
          >
            Edit Recap
          </Link>
        )}
      </div>

      <h1 style={{ margin: '0 0 var(--space-5)' }}>Session Recap</h1>

      {/* Empty state: no recap filled yet */}
      {!recap?.recapUpdatedAt ? (
        <p className="res-resource__meta">
          The teacher has not filled this recap yet.
        </p>
      ) : (
        <>
          {/* Recording */}
          {recap.recordingUrl && (
            <section style={{ marginBottom: 'var(--space-5)' }}>
              <h2 style={{ margin: '0 0 var(--space-3)', fontSize: '1rem', fontWeight: 600 }}>
                Recording
              </h2>
              <a
                href={recap.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="res-btn res-btn--primary"
              >
                Watch Recording
              </a>
            </section>
          )}

          {/* Notes */}
          {recap.notesHtml && (
            <section style={{ marginBottom: 'var(--space-5)' }}>
              <h2 style={{ margin: '0 0 var(--space-3)', fontSize: '1rem', fontWeight: 600 }}>
                Notes
              </h2>
              {/* notesHtml is sanitized server-side — safe to render directly */}
              <div
                className="ann-body"
                dangerouslySetInnerHTML={{ __html: recap.notesHtml }}
              />
            </section>
          )}

          {/* Linked resources */}
          {recap.linkedResources.length > 0 && (
            <section style={{ marginBottom: 'var(--space-5)' }}>
              <h2 style={{ margin: '0 0 var(--space-3)', fontSize: '1rem', fontWeight: 600 }}>
                Resources
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {recap.linkedResources.map((resource) => (
                  <li key={resource.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span className="res-resource__name">{resource.title}</span>
                    <span className="res-resource__meta">{resource.type}</span>
                    <button
                      type="button"
                      className="res-btn res-btn--sm res-btn--ghost"
                      onClick={() => void downloadResource(resource.id, resource.title)}
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Linked assignments */}
          {recap.linkedAssignments.length > 0 && (
            <section style={{ marginBottom: 'var(--space-5)' }}>
              <h2 style={{ margin: '0 0 var(--space-3)', fontSize: '1rem', fontWeight: 600 }}>
                Assignments
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {recap.linkedAssignments.map((assignment) => (
                  <li key={assignment.id}>
                    {courseId ? (
                      <Link
                        to={`/courses/${courseId}`}
                        className="res-resource__name"
                        style={{ textDecoration: 'underline' }}
                      >
                        {assignment.title}
                      </Link>
                    ) : (
                      <span className="res-resource__name">{assignment.title}</span>
                    )}
                    <span className="res-resource__meta" style={{ marginLeft: 'var(--space-3)' }}>
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="res-resource__meta" style={{ marginTop: 'var(--space-4)' }}>
            Last updated: {new Date(recap.recapUpdatedAt).toLocaleString()}
          </p>
        </>
      )}
    </div>
  );
};

export default SessionRecapPage;
