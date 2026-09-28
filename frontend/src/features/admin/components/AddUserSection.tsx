import useAddUserSection from '../hooks/useAddUserSection';
import TempPasswordPanel from './TempPasswordPanel';

/** Thin UI for the Add-user form — all logic lives in `useAddUserSection`. */
const AddUserSection = () => {
  const {
    fullName,
    email,
    role,
    classGroupId,
    classGroups,
    classGroupsLoading,
    fieldError,
    serverError,
    isPending,
    createdUser,
    onFullNameChange,
    onEmailChange,
    onRoleChange,
    onClassGroupChange,
    onSubmit,
    onReset,
  } = useAddUserSection();

  return (
    <section className="admin-section">

      {createdUser && (
        <TempPasswordPanel
          title="User created — temporary password"
          email={createdUser.email}
          password={createdUser.temporaryPassword}
        />
      )}

      <form className="admin-form" onSubmit={onSubmit} noValidate>
        <label className="admin-field">
          <span>Full name</span>
          <input
            type="text"
            value={fullName}
            onChange={(event) => onFullNameChange(event.target.value)}
            disabled={isPending}
            required
          />
        </label>

        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            disabled={isPending}
            required
          />
        </label>

        <label className="admin-field">
          <span>Role</span>
          <select
            value={role}
            onChange={(event) => onRoleChange(event.target.value as 'STUDENT' | 'TEACHER')}
            disabled={isPending}
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
          </select>
        </label>

        <label className="admin-field">
          <span>Class group (optional)</span>
          <select
            value={classGroupId ?? ''}
            onChange={(event) =>
              onClassGroupChange(event.target.value ? Number(event.target.value) : null)
            }
            disabled={isPending || classGroupsLoading}
          >
            <option value="">— None —</option>
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
          <button type="submit" className="btn btn--primary" disabled={isPending}>
            {isPending ? 'Creating…' : 'Create user'}
          </button>
          {createdUser && (
            <button type="button" className="btn" onClick={onReset}>
              Add another
            </button>
          )}
        </div>
      </form>
    </section>
  );
};

export default AddUserSection;
