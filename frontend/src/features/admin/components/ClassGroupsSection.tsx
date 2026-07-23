import useClassGroupsSection from '../hooks/useClassGroupsSection';

/** Thin UI for class-group management — logic lives in `useClassGroupsSection`. */
const ClassGroupsSection = () => {
  const {
    classGroups,
    isLoading,
    isError,
    actionError,
    newName,
    createPending,
    editingId,
    editingName,
    teacherInputs,
    busyGroupId,
    onNewNameChange,
    onCreate,
    onStartRename,
    onEditingNameChange,
    onSubmitRename,
    onCancelRename,
    onDelete,
    onTeacherInputChange,
    onAssignTeacher,
    onRevokeTeacher,
  } = useClassGroupsSection();

  return (
    <section className="admin-section">
      <h2 className="admin-section__title">Class groups</h2>

      <form className="admin-inline-form" onSubmit={onCreate}>
        <input
          type="text"
          placeholder="New class group name"
          value={newName}
          onChange={(event) => onNewNameChange(event.target.value)}
          disabled={createPending}
        />
        <button
          type="submit"
          className="admin-button admin-button--primary"
          disabled={createPending}
        >
          {createPending ? 'Creating…' : 'Create'}
        </button>
      </form>

      {actionError && <p className="admin-error">{actionError}</p>}

      {isLoading && <p className="admin-note">Loading class groups…</p>}

      {isError && (
        <p className="admin-error" role="alert">
          Could not load class groups. Check the backend and try again.
        </p>
      )}

      {!isLoading && !isError && classGroups.length === 0 && (
        <p className="admin-note">No class groups yet. Create the first one above.</p>
      )}

      {!isLoading && !isError && classGroups.length > 0 && (
        <ul className="admin-group-list">
          {classGroups.map((group) => {
            const busy = busyGroupId === group.id;
            const isEditing = editingId === group.id;
            return (
              <li key={group.id} className="admin-group">
                {isEditing ? (
                  <form className="admin-inline-form" onSubmit={onSubmitRename}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(event) => onEditingNameChange(event.target.value)}
                      disabled={busy}
                    />
                    <button type="submit" className="admin-button admin-button--sm" disabled={busy}>
                      Save
                    </button>
                    <button
                      type="button"
                      className="admin-button admin-button--sm admin-button--ghost"
                      onClick={onCancelRename}
                      disabled={busy}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="admin-group__header">
                    <span className="admin-group__name">{group.name}</span>
                    <span className="admin-badge">
                      {group.memberCount} member{group.memberCount === 1 ? '' : 's'}
                    </span>
                    <div className="admin-group__actions">
                      <button
                        type="button"
                        className="admin-button admin-button--sm"
                        onClick={() => onStartRename(group)}
                        disabled={busy}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button--sm"
                        onClick={() => onDelete(group)}
                        disabled={busy}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                <div className="admin-group__teachers">
                  <input
                    type="number"
                    min={1}
                    placeholder="Teacher user id"
                    value={teacherInputs[group.id] ?? ''}
                    onChange={(event) => onTeacherInputChange(group.id, event.target.value)}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="admin-button admin-button--sm"
                    onClick={() => onAssignTeacher(group.id)}
                    disabled={busy}
                  >
                    Assign teacher
                  </button>
                  <button
                    type="button"
                    className="admin-button admin-button--sm admin-button--ghost"
                    onClick={() => onRevokeTeacher(group.id)}
                    disabled={busy}
                  >
                    Revoke
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default ClassGroupsSection;
