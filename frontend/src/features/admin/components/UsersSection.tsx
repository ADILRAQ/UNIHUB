import useUsersSection from '../hooks/useUsersSection';
import TempPasswordPanel from './TempPasswordPanel';

/** Thin UI for the Users list, filters, pagination and row actions. */
const UsersSection = () => {
  const {
    filters,
    searchInput,
    classGroups,
    page,
    data,
    isLoading,
    isError,
    actionError,
    busyUserId,
    resetResult,
    onRoleFilterChange,
    onStatusFilterChange,
    onClassGroupFilterChange,
    onSearchInputChange,
    onSearchSubmit,
    onClearFilters,
    onPrevPage,
    onNextPage,
    onToggleStatus,
    onResetPassword,
    onDismissReset,
  } = useUsersSection();

  const totalPages = data?.totalPages ?? 0;

  return (
    <section className="admin-section">
      <h2 className="admin-section__title">Users</h2>

      {resetResult && (
        <div className="admin-stack">
          <TempPasswordPanel
            title="Password reset — temporary password"
            email={resetResult.email}
            password={resetResult.temporaryPassword}
          />
          <button type="button" className="admin-button" onClick={onDismissReset}>
            Dismiss
          </button>
        </div>
      )}

      <div className="admin-filters">
        <label className="admin-field">
          <span>Role</span>
          <select
            value={filters.role}
            onChange={(event) =>
              onRoleFilterChange(event.target.value as typeof filters.role)
            }
          >
            <option value="">All</option>
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>

        <label className="admin-field">
          <span>Status</span>
          <select
            value={filters.status}
            onChange={(event) =>
              onStatusFilterChange(event.target.value as typeof filters.status)
            }
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>

        <label className="admin-field">
          <span>Class group</span>
          <select
            value={filters.classGroupId ?? ''}
            onChange={(event) =>
              onClassGroupFilterChange(event.target.value ? Number(event.target.value) : null)
            }
          >
            <option value="">All</option>
            {classGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>

        <form className="admin-search" onSubmit={onSearchSubmit}>
          <label className="admin-field">
            <span>Search</span>
            <input
              type="search"
              placeholder="Name or email"
              value={searchInput}
              onChange={(event) => onSearchInputChange(event.target.value)}
            />
          </label>
          <button type="submit" className="admin-button">
            Search
          </button>
        </form>

        <button type="button" className="admin-button admin-button--ghost" onClick={onClearFilters}>
          Clear
        </button>
      </div>

      {actionError && <p className="admin-error">{actionError}</p>}

      {isLoading && <p className="admin-note">Loading users…</p>}

      {isError && (
        <p className="admin-error" role="alert">
          Could not load users. Check the backend and try again.
        </p>
      )}

      {!isLoading && !isError && data && data.content.length === 0 && (
        <p className="admin-note">No users match these filters.</p>
      )}

      {!isLoading && !isError && data && data.content.length > 0 && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {data.content.map((user) => {
                  const busy = busyUserId === user.id;
                  return (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <span
                          className={`admin-badge admin-badge--${user.status.toLowerCase()}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="admin-table__actions">
                        <button
                          type="button"
                          className="admin-button admin-button--sm"
                          onClick={() => onToggleStatus(user)}
                          disabled={busy}
                        >
                          {user.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                        </button>
                        <button
                          type="button"
                          className="admin-button admin-button--sm"
                          onClick={() => onResetPassword(user)}
                          disabled={busy}
                        >
                          Reset password
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <button
              type="button"
              className="admin-button admin-button--sm"
              onClick={onPrevPage}
              disabled={page <= 0}
            >
              Previous
            </button>
            <span className="admin-note">
              Page {page + 1} of {Math.max(totalPages, 1)} · {data.totalElements} user
              {data.totalElements === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              className="admin-button admin-button--sm"
              onClick={onNextPage}
              disabled={page + 1 >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default UsersSection;
