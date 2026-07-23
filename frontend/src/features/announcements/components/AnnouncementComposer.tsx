/**
 * Create / edit form for announcements (teacher + admin only).
 * Thin UI: delegates all state/logic to useComposer.
 */
import { useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import useComposer from '../hooks/useComposer';
import RichTextEditor from './RichTextEditor';
import type { AnnouncementDto } from '../types';

interface AnnouncementComposerProps {
  initialAnnouncement?: AnnouncementDto;
}

const AnnouncementComposer = ({ initialAnnouncement }: AnnouncementComposerProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // bodyHtml is owned by RichTextEditor; we capture it via a ref so we can
  // read it synchronously when the form is submitted.
  const bodyRef = useRef<string>(initialAnnouncement?.bodyHtml ?? '');

  const {
    title,
    classGroupId,
    pinned,
    urgent,
    isSaving,
    isDeleting,
    error,
    isEditing,
    availableGroups,
    isLoadingGroups,
    onTitleChange,
    onGroupChange,
    onPinnedChange,
    onUrgentChange,
    onSubmit,
    onDelete,
  } = useComposer({ initialAnnouncement });

  const role = user?.role ?? '';
  const userId = user?.userId ?? 0;

  // A teacher with exactly one group has it auto-selected; hide the dropdown.
  const showGroupSelector =
    role === 'ADMIN' || (role === 'TEACHER' && availableGroups.length > 1);

  const canDelete =
    isEditing &&
    initialAnnouncement &&
    (role === 'ADMIN' || initialAnnouncement.authorId === userId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(bodyRef.current);
  };

  return (
    <form className="ann-composer" onSubmit={handleSubmit} noValidate>
      <h2 className="ann-composer__heading">
        {isEditing ? 'Edit announcement' : 'New announcement'}
      </h2>

      {/* Title */}
      <div className="ann-composer__field">
        <label htmlFor="ann-title" className="ann-composer__label">
          Title
        </label>
        <input
          id="ann-title"
          type="text"
          className="ann-composer__title-input"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Announcement title"
          required
          disabled={isSaving}
        />
      </div>

      {/* Target group selector (admin always; teacher if > 1 group) */}
      {showGroupSelector && (
        <div className="ann-composer__field">
          <label htmlFor="ann-group" className="ann-composer__label">
            Audience
          </label>
          {isLoadingGroups ? (
            <p className="ann-composer__hint">Loading groups&hellip;</p>
          ) : (
            <select
              id="ann-group"
              className="ann-composer__target"
              value={classGroupId ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                onGroupChange(val === '' ? null : Number(val));
              }}
              disabled={isSaving}
            >
              {role === 'ADMIN' && (
                <option value="">Department-wide</option>
              )}
              {availableGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Rich text body */}
      <div className="ann-composer__field">
        <label className="ann-composer__label">Body</label>
        <RichTextEditor
          content={initialAnnouncement?.bodyHtml ?? ''}
          onChange={(html) => { bodyRef.current = html; }}
          disabled={isSaving}
        />
      </div>

      {/* Pinned + urgent toggles (not shown in edit mode — use detail page toggles) */}
      {!isEditing && (
        <div className="ann-composer__toggles">
          <label className="ann-composer__toggle-label">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => onPinnedChange(e.target.checked)}
              disabled={isSaving}
            />
            Pinned
          </label>
          <label className="ann-composer__toggle-label">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => onUrgentChange(e.target.checked)}
              disabled={isSaving}
            />
            Urgent
          </label>
        </div>
      )}

      {/* Error */}
      {error && <p className="ann-error">{error}</p>}

      {/* Actions */}
      <div className="ann-composer__actions">
        <button
          type="submit"
          className="ann-btn ann-btn--primary"
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Publish'}
        </button>

        <button
          type="button"
          className="ann-btn"
          onClick={() => navigate(-1)}
          disabled={isSaving}
        >
          Cancel
        </button>

        {canDelete && (
          <button
            type="button"
            className="ann-btn ann-btn--danger"
            onClick={onDelete}
            disabled={isDeleting || isSaving}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </form>
  );
};

export default AnnouncementComposer;
