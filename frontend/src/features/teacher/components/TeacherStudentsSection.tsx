import TempPasswordPanel from '../../admin/components/TempPasswordPanel';
import useTeacherStudentsSection from '../hooks/useTeacherStudentsSection';

/** Thin UI for the teacher's student list and add-student form. All logic lives in `useTeacherStudentsSection`. */
const TeacherStudentsSection = () => {
  const {
    students,
    studentsLoading,
    classGroups,
    classGroupsLoading,
    showForm,
    fullName,
    email,
    classGroupId,
    createdUser,
    fieldError,
    serverError,
    isPending,
    onToggleForm,
    onFullNameChange,
    onEmailChange,
    onClassGroupChange,
    onSubmit,
    onReset,
  } = useTeacherStudentsSection();

  return (
    <section className="admin-section">
      <h2 className="admin-section__title">My students</h2>

      {createdUser && (
        <TempPasswordPanel
          title="Student created — temporary password"
          email={createdUser.email}
          password={createdUser.temporaryPassword}
        />
      )}

      <div className="admin-form__actions">
        <button type="button" className="admin-button admin-button--primary" onClick={onToggleForm}>
          {showForm ? 'Cancel' : 'Add student'}
        </button>
        {createdUser && (
          <button type="button" className="admin-button" onClick={onReset}>
            Add another
          </button>
        )}
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={onSubmit} noValidate>
          <label className="admin-field">
            <span>Full name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              disabled={isPending}
              required
            />
          </label>

          <label className="admin-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
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

          {fieldError && <p className="admin-error">{fieldError}</p>}
          {serverError && <p className="admin-error">{serverError}</p>}

          <div className="admin-form__actions">
            <button
              type="submit"
              className="admin-button admin-button--primary"
              disabled={isPending}
            >
              {isPending ? 'Creating…' : 'Create student'}
            </button>
            <button type="button" className="admin-button" onClick={onToggleForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {studentsLoading && <p className="admin-note">Loading students…</p>}

      {!studentsLoading && students.length === 0 && (
        <p className="admin-note">No students in your groups yet.</p>
      )}

      {!studentsLoading && students.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Full name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.fullName}</td>
                  <td>{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default TeacherStudentsSection;
