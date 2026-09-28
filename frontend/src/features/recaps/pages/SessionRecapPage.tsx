import { Link } from 'react-router-dom';
import useSessionRecapPage from '../hooks/useSessionRecapPage';
import PageHeader from '../../../components/layout/PageHeader';

const SessionRecapPage = () => {
  const { recap, isLoading, isError, sessionId, courseId, canEdit, handleDownload } = useSessionRecapPage();
  const courseQuery = courseId ? `?courseId=${courseId}` : '';
  const backTo = courseId ? `/courses/${courseId}` : '/courses';
  const backLabel = courseId ? 'Back to course' : 'Back to courses';

  const headerActions = canEdit ? (
    <Link
      to={`/sessions/${sessionId}/recap/edit${courseQuery}`}
      className="btn btn--primary"
    >
      {recap?.recapUpdatedAt ? 'Edit recap' : 'Write recap'}
    </Link>
  ) : undefined;

  return (
    <>
      <PageHeader title="Session recap" breadcrumb={backLabel} breadcrumbTo={backTo} actions={headerActions} />
      <div className="page-body" style={{ maxWidth: 824 }}>
        <div>
          {isLoading && <div className="skeleton" style={{ height: 240 }} />}
          {isError && (
            <div role="alert" className="alert">
              Failed to load session recap. Please try again.
            </div>
          )}

          {!isLoading && !isError && !recap?.recapUpdatedAt && (
            <div className="empty-state">
              <h2 className="empty-state__title">No recap yet</h2>
              <p className="empty-state__body">
                {canEdit ? 'Add the recording, notes and linked material so students who missed the class can catch up.' : 'The teacher has not filled this recap yet.'}
              </p>
            </div>
          )}

          {!isLoading && !isError && recap?.recapUpdatedAt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Recording */}
              {recap.recordingUrl && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h2 className="overline" style={{ margin: 0 }}>Recording</h2>
                  <a href={recap.recordingUrl} target="_blank" rel="noopener noreferrer" className="btn btn--soft" style={{ alignSelf: 'flex-start' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="m15.5 10.5 6-3.2v9.4l-6-3.2"/>
                    </svg>
                    Watch recording
                  </a>
                </div>
              )}

              {/* Notes */}
              {recap.notesHtml && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h2 className="overline" style={{ margin: 0 }}>Notes</h2>
                  {/* notesHtml is sanitized server-side — safe to render */}
                  <div className="prose" style={{ fontSize: 16 }} dangerouslySetInnerHTML={{ __html: recap.notesHtml }} />
                </div>
              )}

              {/* Resources */}
              {recap.linkedResources.length > 0 && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h2 className="overline" style={{ margin: 0 }}>Resources</h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recap.linkedResources.map((r) => (
                      <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 'var(--radius-sm)', background: 'var(--orange-100)', color: 'var(--orange-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-6-5Z"/><path d="M13 3v5h6"/></svg>
                        </span>
                        <span style={{ flexGrow: 1, fontSize: 13, color: 'var(--ink-700)' }}>{r.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>{r.contentType?.split('/').pop()?.toUpperCase() ?? 'LINK'}</span>
                        {r.contentType ? (
                          <button type="button" className="btn btn--sm" onClick={() => handleDownload(r.id, r.name)}>Download</button>
                        ) : courseId ? (
                          // ponytail: recap DTO carries no URL for links, so open them from the course's resource list
                          <Link to={`/courses/${courseId}`} className="btn btn--sm">Open in course</Link>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Assignments */}
              {recap.linkedAssignments.length > 0 && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h2 className="overline" style={{ margin: 0 }}>Assignments</h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recap.linkedAssignments.map((a) => (
                      <li key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        {courseId ? (
                          <Link to={`/courses/${courseId}?tab=assignments`} style={{ flexGrow: 1, fontSize: 13, color: 'var(--orange-700)', fontWeight: 600 }}>{a.title}</Link>
                        ) : (
                          <span style={{ flexGrow: 1, fontSize: 13, color: 'var(--ink-700)' }}>{a.title}</span>
                        )}
                        <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>Due: {new Date(a.dueAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-500)' }}>
                Last updated: {new Date(recap.recapUpdatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SessionRecapPage;
