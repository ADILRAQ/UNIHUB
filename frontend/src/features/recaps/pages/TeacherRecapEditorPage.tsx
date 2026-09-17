/**
 * Teacher recap editor page (TEACHER / ADMIN only).
 *
 * Pre-fills from the existing recap (if any), lets the teacher set a recording
 * URL, write notes, and pick linked resources and assignments via checkboxes.
 * On save, PUTs to /api/sessions/{sessionId}/recap and redirects to the view page.
 *
 * The `courseId` query param is required for the resource/assignment pickers.
 * It is forwarded from the CoursePage past-sessions list and from the view page.
 */
import { Link } from 'react-router-dom';
import useTeacherRecapEditorPage from '../hooks/useTeacherRecapEditorPage';

const TeacherRecapEditorPage = () => {
  const {
    isLoadingRecap,
    isLoadingResources,
    isLoadingAssignments,
    resources,
    assignments,
    recordingUrl,
    setRecordingUrl,
    notesHtml,
    setNotesHtml,
    selectedResourceIds,
    toggleResource,
    selectedAssignmentIds,
    toggleAssignment,
    isSaving,
    handleSubmit,
    sessionId,
    courseId,
  } = useTeacherRecapEditorPage();

  if (isLoadingRecap) {
    return (
      <div className="res-page">
        <p className="res-resource__meta">Loading recap&hellip;</p>
      </div>
    );
  }

  const backHref = `/sessions/${sessionId}/recap${courseId ? `?courseId=${courseId}` : ''}`;

  return (
    <div className="res-page">
      <Link
        to={backHref}
        className="res-btn res-btn--ghost"
        style={{ marginBottom: 'var(--space-4)', display: 'inline-block' }}
      >
        &larr; Back to recap
      </Link>

      <h1 style={{ margin: '0 0 var(--space-5)' }}>Edit Recap</h1>

      <div className="res-form">
        {/* Recording URL */}
        <div className="res-form__field">
          <label className="label" htmlFor="recap-recording-url">
            Recording URL
          </label>
          <input
            id="recap-recording-url"
            className="input"
            type="url"
            placeholder="https://meet.google.com/..."
            value={recordingUrl}
            onChange={(e) => setRecordingUrl(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="res-form__field">
          <label className="label" htmlFor="recap-notes">
            Notes
          </label>
          <textarea
            id="recap-notes"
            className="input"
            rows={8}
            placeholder="Session notes, key points, references…"
            value={notesHtml}
            onChange={(e) => setNotesHtml(e.target.value)}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* Resource checkboxes */}
        <div className="res-form__field">
          <p className="label" style={{ marginBottom: 'var(--space-2)' }}>
            Linked Resources
          </p>
          {isLoadingResources ? (
            <p className="res-resource__meta">Loading resources&hellip;</p>
          ) : resources.length === 0 ? (
            <p className="res-resource__meta">No resources found for this course.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {resources.map((resource) => (
                <li key={resource.id}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedResourceIds.includes(resource.id)}
                      onChange={() => toggleResource(resource.id)}
                    />
                    <span>{resource.name}</span>
                    <span className="res-resource__meta">{resource.contentType.split('/').pop()?.toUpperCase()}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Assignment checkboxes */}
        <div className="res-form__field">
          <p className="label" style={{ marginBottom: 'var(--space-2)' }}>
            Linked Assignments
          </p>
          {isLoadingAssignments ? (
            <p className="res-resource__meta">Loading assignments&hellip;</p>
          ) : assignments.length === 0 ? (
            <p className="res-resource__meta">No assignments found for this course.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {assignments.map((assignment) => (
                <li key={assignment.id}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedAssignmentIds.includes(assignment.id)}
                      onChange={() => toggleAssignment(assignment.id)}
                    />
                    <span>{assignment.title}</span>
                    <span className="res-resource__meta">
                      Due: {new Date(assignment.dueAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="res-form__actions">
          <button
            type="button"
            className="res-btn res-btn--primary"
            disabled={isSaving}
            onClick={handleSubmit}
          >
            {isSaving ? 'Saving…' : 'Save Recap'}
          </button>
          <Link to={backHref} className="res-btn res-btn--ghost">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherRecapEditorPage;
