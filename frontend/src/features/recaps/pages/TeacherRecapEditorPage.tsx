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
    <div style={{ display: 'flex', gap: 8 }}>
      <Link to={backHref} style={{ display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 16px', border: '1px solid #E1DEF2', borderRadius: 10, background: '#FFFFFF', color: '#45435A', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
        Cancel
      </Link>
      <button
        type="button"
        disabled={isSaving}
        onClick={handleSubmit}
        style={{ height: 40, padding: '0 18px', border: 0, borderRadius: 10, background: isSaving ? '#8A84E8' : '#5A4FE0', color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer' }}
      >
        {isSaving ? 'Saving…' : 'Save Recap'}
      </button>
    </div>
  );

  if (isLoadingRecap) {
    return (
      <>
        <PageHeader title="Edit Recap" breadcrumb="Back to recap" breadcrumbTo={backHref} />
        <main style={{ padding: 32 }}>
          <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>Loading recap…</p>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Edit Recap" breadcrumb="Back to recap" breadcrumbTo={backHref} actions={headerActions} />
      <main style={{ flexGrow: 1, padding: '28px 32px 60px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Recording URL */}
          <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label htmlFor="recap-recording-url" style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>Recording URL</label>
            <input
              id="recap-recording-url"
              type="url"
              placeholder="https://meet.google.com/..."
              value={recordingUrl}
              onChange={(e) => setRecordingUrl(e.target.value)}
              style={{ height: 46, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 9, padding: '0 14px', fontSize: 15, color: '#1F1B33', width: '100%', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          {/* Notes */}
          <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label htmlFor="recap-notes" style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>Notes</label>
            <textarea
              id="recap-notes"
              rows={8}
              placeholder="Session notes, key points, references…"
              value={notesHtml}
              onChange={(e) => setNotesHtml(e.target.value)}
              style={{ boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 9, padding: '12px 14px', fontSize: 14, color: '#1F1B33', width: '100%', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          {/* Resources */}
          <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>Linked Resources</span>
            {isLoadingResources && <p style={{ margin: 0, fontSize: 13.5, color: '#6B6B7B' }}>Loading resources…</p>}
            {!isLoadingResources && resources.length === 0 && <p style={{ margin: 0, fontSize: 13.5, color: '#6B6B7B' }}>No resources found for this course.</p>}
            {!isLoadingResources && resources.map((r) => (
              <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedResourceIds.includes(r.id)} onChange={() => toggleResource(r.id)} style={{ width: 16, height: 16, accentColor: '#4A41C9' }} />
                <span style={{ fontSize: 13.5, color: '#33314A' }}>{r.name}</span>
                <span style={{ fontSize: 11.5, color: '#8D8B9C' }}>{r.contentType.split('/').pop()?.toUpperCase()}</span>
              </label>
            ))}
          </div>

          {/* Assignments */}
          <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>Linked Assignments</span>
            {isLoadingAssignments && <p style={{ margin: 0, fontSize: 13.5, color: '#6B6B7B' }}>Loading assignments…</p>}
            {!isLoadingAssignments && assignments.length === 0 && <p style={{ margin: 0, fontSize: 13.5, color: '#6B6B7B' }}>No assignments found for this course.</p>}
            {!isLoadingAssignments && assignments.map((a) => (
              <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAssignmentIds.includes(a.id)} onChange={() => toggleAssignment(a.id)} style={{ width: 16, height: 16, accentColor: '#4A41C9' }} />
                <span style={{ fontSize: 13.5, color: '#33314A' }}>{a.title}</span>
                <span style={{ fontSize: 12, color: '#6B6B7B' }}>Due: {new Date(a.dueAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </label>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default TeacherRecapEditorPage;
