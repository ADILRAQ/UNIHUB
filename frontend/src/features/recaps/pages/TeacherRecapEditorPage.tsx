import { Link } from 'react-router-dom';
import useTeacherRecapEditorPage from '../hooks/useTeacherRecapEditorPage';
import PageHeader from '../../../components/layout/PageHeader';

const TeacherRecapEditorPage = () => {
  const {
    isLoadingRecap, isLoadingResources, isLoadingAssignments,
    resources, assignments,
    recordingUrl, setRecordingUrl, notesHtml, setNotesHtml,
    selectedResourceIds, toggleResource,
    selectedAssignmentIds, toggleAssignment,
    isSaving, handleSubmit, sessionId, courseId,
  } = useTeacherRecapEditorPage();

  const backHref = `/sessions/${sessionId}/recap${courseId ? `?courseId=${courseId}` : ''}`;

  const headerActions = (
    <>
      <Link to={backHref} className="btn btn--ghost">Cancel</Link>
      <button type="button" className="btn btn--primary" disabled={isSaving} onClick={handleSubmit}>
        {isSaving ? 'Saving…' : 'Save recap'}
      </button>
    </>
  );

  if (isLoadingRecap) {
    return (
      <>
        <PageHeader title="Edit recap" breadcrumb="Back to recap" breadcrumbTo={backHref} />
        <div className="page-body">
          <div className="skeleton" style={{ height: 320 }} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Edit recap" breadcrumb="Back to recap" breadcrumbTo={backHref} actions={headerActions} />
      <div className="page-body" style={{ maxWidth: 824 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Recording URL */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label htmlFor="recap-recording-url" className="label">Recording URL</label>
            <input
              id="recap-recording-url"
              type="url"
              placeholder="https://meet.google.com/..."
              value={recordingUrl}
              onChange={(e) => setRecordingUrl(e.target.value)}
              className="input"
            />
          </div>

          {/* Notes */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label htmlFor="recap-notes" className="label">Notes</label>
            <textarea
              id="recap-notes"
              rows={8}
              placeholder="Session notes, key points, references…"
              value={notesHtml}
              onChange={(e) => setNotesHtml(e.target.value)}
              className="textarea"
            />
          </div>

          {/* Resources */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="label">Linked resources</span>
            {isLoadingResources && <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-500)' }}>Loading resources…</p>}
            {!isLoadingResources && resources.length === 0 && <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-500)' }}>No resources found for this course.</p>}
            {!isLoadingResources && resources.map((r) => (
              <label key={r.id} className="sched-check">
                <input type="checkbox" checked={selectedResourceIds.includes(r.id)} onChange={() => toggleResource(r.id)} style={{ width: 16, height: 16, accentColor: 'var(--orange-500)' }} />
                <span style={{ fontSize: 13, color: 'var(--ink-700)' }}>{r.name}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>{r.contentType?.split('/').pop()?.toUpperCase() ?? 'LINK'}</span>
              </label>
            ))}
          </div>

          {/* Assignments */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="label">Linked assignments</span>
            {isLoadingAssignments && <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-500)' }}>Loading assignments…</p>}
            {!isLoadingAssignments && assignments.length === 0 && <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-500)' }}>No assignments found for this course.</p>}
            {!isLoadingAssignments && assignments.map((a) => (
              <label key={a.id} className="sched-check">
                <input type="checkbox" checked={selectedAssignmentIds.includes(a.id)} onChange={() => toggleAssignment(a.id)} style={{ width: 16, height: 16, accentColor: 'var(--orange-500)' }} />
                <span style={{ fontSize: 13, color: 'var(--ink-700)' }}>{a.title}</span>
                <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>Due: {new Date(a.dueAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherRecapEditorPage;
