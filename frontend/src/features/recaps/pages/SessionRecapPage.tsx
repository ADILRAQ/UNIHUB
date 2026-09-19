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
      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px', border: 0, borderRadius: 10, background: '#5A4FE0', color: '#FFFFFF', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}
    >
      Edit Recap
    </Link>
  ) : undefined;

  return (
    <>
      <PageHeader title="Session Recap" breadcrumb={backLabel} breadcrumbTo={backTo} actions={headerActions} />
      <main style={{ flexGrow: 1, padding: '28px 32px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 760 }}>
          {isLoading && <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>Loading recap…</p>}
          {isError && (
            <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: '#B91C1C' }}>
              Failed to load session recap. Please try again.
            </div>
          )}

          {!isLoading && !isError && !recap?.recapUpdatedAt && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '64px 0', color: '#6B6B7B' }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#C9C7DA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="m15.5 10.5 6-3.2v9.4l-6-3.2"/>
              </svg>
              <span style={{ fontSize: 14 }}>The teacher has not filled this recap yet.</span>
            </div>
          )}

          {!isLoading && !isError && recap?.recapUpdatedAt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Recording */}
              {recap.recordingUrl && (
                <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#45435A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recording</h2>
                  <a href={recap.recordingUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 16px', border: 0, borderRadius: 9, background: '#5A4FE0', color: '#FFFFFF', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="m15.5 10.5 6-3.2v9.4l-6-3.2"/>
                    </svg>
                    Watch Recording
                  </a>
                </div>
              )}

              {/* Notes */}
              {recap.notesHtml && (
                <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#45435A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</h2>
                  {/* notesHtml is sanitized server-side — safe to render */}
                  <div className="ann-prose" style={{ fontSize: 15, lineHeight: 1.75, color: '#33314A' }} dangerouslySetInnerHTML={{ __html: recap.notesHtml }} />
                </div>
              )}

              {/* Resources */}
              {recap.linkedResources.length > 0 && (
                <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#45435A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resources</h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recap.linkedResources.map((r) => (
                      <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F5F4FA' }}>
                        <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, background: '#F5F4FA', color: '#6B6B7B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-6-5Z"/><path d="M13 3v5h6"/></svg>
                        </span>
                        <span style={{ flexGrow: 1, fontSize: 13.5, color: '#33314A' }}>{r.name}</span>
                        <span style={{ fontSize: 11.5, color: '#8D8B9C' }}>{r.contentType.split('/').pop()?.toUpperCase()}</span>
                        <button type="button" onClick={() => handleDownload(r.id, r.name)} style={{ height: 32, padding: '0 12px', border: '1px solid #E1DEF2', borderRadius: 8, background: '#FFFFFF', color: '#45435A', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Download</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Assignments */}
              {recap.linkedAssignments.length > 0 && (
                <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#45435A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assignments</h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recap.linkedAssignments.map((a) => (
                      <li key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F5F4FA' }}>
                        {courseId ? (
                          <Link to={`/courses/${courseId}?tab=assignments`} style={{ flexGrow: 1, fontSize: 13.5, color: '#4A41C9', fontWeight: 600 }}>{a.title}</Link>
                        ) : (
                          <span style={{ flexGrow: 1, fontSize: 13.5, color: '#33314A' }}>{a.title}</span>
                        )}
                        <span style={{ fontSize: 12, color: '#6B6B7B' }}>Due: {new Date(a.dueAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p style={{ margin: 0, fontSize: 12.5, color: '#8D8B9C' }}>
                Last updated: {new Date(recap.recapUpdatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default SessionRecapPage;
