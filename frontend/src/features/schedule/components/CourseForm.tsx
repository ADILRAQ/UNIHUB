import type { UseCourseManager } from '../hooks/useCourseManager';

type CourseFormProps = Pick<
  UseCourseManager,
  'isEditing' | 'form' | 'teachers' | 'classGroups' | 'onCloseForm' | 'onFormChange' | 'onSubmit' | 'isSaving' | 'error'
>;

/**
 * Modal course create/edit form (admin only). Pure UI — all state and mutations
 * live in `useCourseManager`. Teacher and class-group dropdowns come from the
 * ADMIN-only option reads.
 */
const CourseForm = ({
  isEditing,
  form,
  teachers,
  classGroups,
  onCloseForm,
  onFormChange,
  onSubmit,
  isSaving,
  error,
}: CourseFormProps) => (
  <div className="sched-dialog-overlay" role="dialog" aria-modal="true" aria-label="Course">
    <div className="sched-dialog">
      <header className="sched-dialog__header">
        <h2 className="sched-dialog__title">{isEditing ? 'Edit course' : 'New course'}</h2>
        <button type="button" className="btn btn--ghost btn--sm" aria-label="Close" onClick={onCloseForm}>
          ×
        </button>
      </header>

      <form onSubmit={onSubmit}>
        <div className="sched-dialog__body">
          <label className="sched-field">
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onFormChange({ name: e.target.value })}
              disabled={isSaving}
              required
            />
          </label>
          <label className="sched-field">
            <span>Teacher</span>
            <select
              value={form.teacherId}
              onChange={(e) => onFormChange({ teacherId: e.target.value })}
              disabled={isSaving}
              required
            >
              <option value="">Select a teacher…</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </label>
          <label className="sched-field">
            <span>Class group</span>
            <select
              value={form.classGroupId}
              onChange={(e) => onFormChange({ classGroupId: e.target.value })}
              disabled={isSaving}
              required
            >
              <option value="">Select a group…</option>
              {classGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label className="sched-field">
            <span>Google Meet link (optional)</span>
            <input
              type="url"
              value={form.meetLink}
              onChange={(e) => onFormChange({ meetLink: e.target.value })}
              disabled={isSaving}
              placeholder="https://meet.google.com/…"
            />
          </label>
          {error && <p className="sched-error">{error}</p>}
        </div>

        <footer className="sched-dialog__footer">
          <button type="button" className="sched-btn" onClick={onCloseForm} disabled={isSaving}>
            Cancel
          </button>
          <button type="submit" className="sched-btn sched-btn--primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Create course'}
          </button>
        </footer>
      </form>
    </div>
  </div>
);

export default CourseForm;
