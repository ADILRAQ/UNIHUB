import useTeacherCoursesSection from '../hooks/useTeacherCoursesSection';

/** Thin UI for the teacher's courses list and create-course form. All logic lives in `useTeacherCoursesSection`. */
const TeacherCoursesSection = () => {
  const {
    courses,
    coursesLoading,
    classGroups,
    classGroupsLoading,
    showForm,
    name,
    classGroupId,
    meetLink,
    fieldError,
    serverError,
    isPending,
    onToggleForm,
    onNameChange,
    onClassGroupChange,
    onMeetLinkChange,
    onSubmit,
    onRowClick,
  } = useTeacherCoursesSection();

  return (
    <section className="admin-section">
      <h2 className="admin-section__title">My courses</h2>

      <div className="admin-form__actions">
        <button type="button" className="admin-button admin-button--primary" onClick={onToggleForm}>
          {showForm ? 'Cancel' : 'Create course'}
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={onSubmit} noValidate>
          <label className="admin-field">
            <span>Course name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={isPending}
              required
            />
          </label>

          <label className="admin-field">
            <span>Class group</span>
            <select
              value={classGroupId ?? ''}
              onChange={(e) => onClassGroupChange(e.target.value ? Number(e.target.value) : null)}
              disabled={isPending || classGroupsLoading}
            >
              <option value="">— Select a group —</option>
              {classGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Google Meet link (optional)</span>
            <input
              type="url"
              value={meetLink}
              onChange={(e) => onMeetLinkChange(e.target.value)}
              disabled={isPending}
              placeholder="https://meet.google.com/..."
            />
          </label>

          {fieldError && <p className="admin-error">{fieldError}</p>}
          {serverError && <p className="admin-error">{serverError}</p>}

          <div className="admin-form__actions">
            <button
              type="submit"
              className="admin-button admin-button--primary"
              disabled={isPending}
            >
              {isPending ? 'Creating…' : 'Create course'}
            </button>
            <button type="button" className="admin-button" onClick={onToggleForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {coursesLoading && <p className="admin-note">Loading courses…</p>}

      {!coursesLoading && courses.length === 0 && (
        <p className="admin-note">No courses yet. Create your first course above.</p>
      )}

      {!coursesLoading && courses.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Class group</th>
                <th>Meet link</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.id}
                  onClick={() => onRowClick(course.id)}
                  style={{ cursor: 'pointer' }}
                  title="Open course"
                >
                  <td>{course.name}</td>
                  <td>{course.classGroupName}</td>
                  <td>
                    {course.meetLink ? (
                      <a
                        href={course.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {course.meetLink}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default TeacherCoursesSection;
