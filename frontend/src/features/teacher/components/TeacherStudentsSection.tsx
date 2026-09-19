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
    selectedStudent,
    onToggleForm,
    onFullNameChange,
    onEmailChange,
    onClassGroupChange,
    onSubmit,
    onReset,
    onSelectStudent,
    onCloseStudent,
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
                <tr
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  style={{ cursor: 'pointer' }}
                  title="View student info"
                >
                  <td>{student.fullName}</td>
                  <td>{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student info modal */}
      {selectedStudent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(31,27,51,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={onCloseStudent}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              border: '1px solid #EDEBF8',
              borderRadius: 16,
              padding: '28px 32px',
              width: 360,
              boxShadow: '0 8px 32px rgba(108,99,255,0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 id="student-modal-title" style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1F1B33' }}>
                Student info
              </h3>
              <button
                type="button"
                onClick={onCloseStudent}
                aria-label="Close"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B7B', fontSize: 20, lineHeight: 1, padding: 4 }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: '50%',
                  background: '#EEEDFF',
                  color: '#4A41C9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {selectedStudent.fullName
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1F1B33' }}>{selectedStudent.fullName}</span>
                <span style={{ fontSize: 13.5, color: '#6B6B7B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedStudent.email}</span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: selectedStudent.status === 'ACTIVE' ? '#D1FAE5' : '#F3F4F6',
                borderRadius: 8,
                padding: '8px 12px',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: selectedStudent.status === 'ACTIVE' ? '#10B981' : '#9CA3AF',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: selectedStudent.status === 'ACTIVE' ? '#047857' : '#4B5563',
                }}
              >
                {selectedStudent.status === 'ACTIVE' ? 'Active account' : 'Inactive account'}
              </span>
            </div>

            <button
              type="button"
              onClick={onCloseStudent}
              style={{
                alignSelf: 'flex-end',
                height: 38,
                padding: '0 18px',
                border: '1px solid #E1DEF2',
                borderRadius: 9,
                background: '#FFFFFF',
                color: '#45435A',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default TeacherStudentsSection;
