import useClassGroupsSection from '../hooks/useClassGroupsSection';
import type { ClassGroupDto } from '../types';

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
    teachers,
    selectedTeacherIds,
    busyGroupId,
    onNewNameChange,
    onCreate,
    onStartRename,
    onEditingNameChange,
    onSubmitRename,
    onCancelRename,
    onDelete,
    onSelectedTeacherChange,
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
          onChange={(e) => onNewNameChange(e.target.value)}
          disabled={createPending}
        />
        <button type="submit" className="admin-button admin-button--primary" disabled={createPending}>
          {createPending ? 'Creating…' : 'Create'}
        </button>
      </form>

      {actionError && <p className="admin-error">{actionError}</p>}
      {isLoading && <p className="admin-note">Loading class groups…</p>}
      {isError && <p className="admin-error" role="alert">Could not load class groups. Check the backend and try again.</p>}
      {!isLoading && !isError && classGroups.length === 0 && (
        <p className="admin-note">No class groups yet. Create the first one above.</p>
      )}

      {!isLoading && !isError && classGroups.length > 0 && (
        <ul className="admin-group-list">
          {classGroups.map((group) => (
            <GroupRow
              key={group.id}
              group={group}
              teachers={teachers}
              selectedTeacherId={selectedTeacherIds[group.id] ?? ''}
              busy={busyGroupId === group.id}
              isEditing={editingId === group.id}
              editingName={editingName}
              onStartRename={onStartRename}
              onEditingNameChange={onEditingNameChange}
              onSubmitRename={onSubmitRename}
              onCancelRename={onCancelRename}
              onDelete={onDelete}
              onSelectedTeacherChange={onSelectedTeacherChange}
              onAssignTeacher={onAssignTeacher}
              onRevokeTeacher={onRevokeTeacher}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

interface GroupRowProps {
  group: ClassGroupDto;
  teachers: ReturnType<typeof useClassGroupsSection>['teachers'];
  selectedTeacherId: number | '';
  busy: boolean;
  isEditing: boolean;
  editingName: string;
  onStartRename: (g: ClassGroupDto) => void;
  onEditingNameChange: (v: string) => void;
  onSubmitRename: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancelRename: () => void;
  onDelete: (g: ClassGroupDto) => void;
  onSelectedTeacherChange: (groupId: number, teacherId: number | '') => void;
  onAssignTeacher: (groupId: number) => void;
  onRevokeTeacher: (g: ClassGroupDto) => void;
}

const GroupRow = ({
  group, teachers, selectedTeacherId, busy, isEditing, editingName,
  onStartRename, onEditingNameChange, onSubmitRename, onCancelRename,
  onDelete, onSelectedTeacherChange, onAssignTeacher, onRevokeTeacher,
}: GroupRowProps) => (
  <li key={group.id} className="admin-group">
    {isEditing ? (
      <form className="admin-inline-form" onSubmit={onSubmitRename}>
        <input
          type="text"
          value={editingName}
          onChange={(e) => onEditingNameChange(e.target.value)}
          disabled={busy}
        />
        <button type="submit" className="admin-button admin-button--sm" disabled={busy}>Save</button>
        <button type="button" className="admin-button admin-button--sm admin-button--ghost" onClick={onCancelRename} disabled={busy}>Cancel</button>
      </form>
    ) : (
      <div className="admin-group__header">
        <span className="admin-group__name">{group.name}</span>
        <span className="admin-badge">{group.memberCount} member{group.memberCount === 1 ? '' : 's'}</span>
        <div className="admin-group__actions">
          <button type="button" className="admin-button admin-button--sm" onClick={() => onStartRename(group)} disabled={busy}>Rename</button>
          <button type="button" className="admin-button admin-button--sm" onClick={() => onDelete(group)} disabled={busy}>Delete</button>
        </div>
      </div>
    )}

    {/* Teacher row */}
    <div className="admin-group__teacher-row">
      {group.teacherName ? (
        <>
          <div className="admin-teacher-chip">
            <span className="admin-teacher-chip__avatar">
              {group.teacherName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
            </span>
            <span className="admin-teacher-chip__name">{group.teacherName}</span>
            <span className="admin-badge admin-badge--active">Teacher</span>
          </div>
          <button
            type="button"
            className="admin-button admin-button--sm admin-button--ghost"
            onClick={() => onRevokeTeacher(group)}
            disabled={busy}
          >
            Remove
          </button>
        </>
      ) : (
        <>
          <span className="admin-teacher-chip admin-teacher-chip--empty">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            No teacher assigned
          </span>
          <select
            value={selectedTeacherId}
            onChange={(e) => onSelectedTeacherChange(group.id, e.target.value ? Number(e.target.value) : '')}
            disabled={busy || teachers.length === 0}
            className="admin-select"
          >
            <option value="">{teachers.length === 0 ? 'No teachers yet' : 'Select teacher…'}</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.fullName} — {t.email}</option>
            ))}
          </select>
          <button
            type="button"
            className="admin-button admin-button--sm admin-button--primary"
            onClick={() => onAssignTeacher(group.id)}
            disabled={busy || !selectedTeacherId}
          >
            Assign
          </button>
        </>
      )}
    </div>
  </li>
);

export default ClassGroupsSection;
