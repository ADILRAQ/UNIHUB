/**
 * Create / edit form for announcements (teacher + admin only) — artboard design.
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
  const showGroupSelector = role === 'ADMIN' || (role === 'TEACHER' && availableGroups.length > 1);
  const canDelete = isEditing && initialAnnouncement && (role === 'ADMIN' || initialAnnouncement.authorId === userId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(bodyRef.current);
  };

  return (
    <>
      {/* Page-level header */}
      <header
        style={{
          height: 72,
          flexShrink: 0,
          boxSizing: 'border-box',
          background: '#FFFFFF',
          borderBottom: '1px solid #E8E6F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={isSaving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px', border: '1px solid #E1DEF2', borderRadius: 10, background: '#FFFFFF', color: '#45435A', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>
          </svg>
          Cancel
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting || isSaving}
              style={{ height: 40, padding: '0 16px', border: '1px solid #F3D3D3', borderRadius: 10, background: '#FFFFFF', color: '#B02F2F', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <button
            type="submit"
            form="ann-composer-form"
            disabled={isSaving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 18px', border: 0, borderRadius: 10, background: isSaving ? '#8A84E8' : '#5A4FE0', color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer' }}
          >
            {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Publish'}
          </button>
        </div>
      </header>

      <form id="ann-composer-form" onSubmit={handleSubmit} noValidate style={{ flexGrow: 1, boxSizing: 'border-box', padding: '32px 32px 60px', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Title + group card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="ann-title" style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>Title</label>
              <input
                id="ann-title"
                type="text"
                placeholder="e.g. Midterm exam schedule"
                value={title}
                onChange={e => onTitleChange(e.target.value)}
                required
                disabled={isSaving}
                style={{ height: 46, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 9, padding: '0 14px', fontSize: 15, color: '#1F1B33', width: '100%', outline: 'none' }}
              />
            </div>

            {showGroupSelector && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="ann-group-select" style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>Class group</label>
                {isLoadingGroups ? (
                  <p style={{ margin: 0, fontSize: 13.5, color: '#6B6B7B' }}>Loading groups…</p>
                ) : (
                  <div style={{ position: 'relative', display: 'flex' }}>
                    <select
                      id="ann-group-select"
                      value={classGroupId ?? ''}
                      onChange={e => onGroupChange(e.target.value === '' ? null : Number(e.target.value))}
                      disabled={isSaving}
                      style={{ width: '100%', height: 46, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 9, padding: '0 38px 0 14px', fontSize: 14.5, color: '#1F1B33', appearance: 'none', background: '#FFFFFF', cursor: 'pointer' }}
                    >
                      {role === 'ADMIN' && <option value="">All class groups</option>}
                      {availableGroups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    <span style={{ position: 'absolute', right: 13, top: 15, color: '#6B6B7B', pointerEvents: 'none' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9.5 6 6 6-6"/></svg>
                    </span>
                  </div>
                )}
                <span style={{ fontSize: 12, color: '#8D8B9C' }}>Only students and teachers in this group will see the post &mdash; pick &ldquo;All class groups&rdquo; for department-wide notices.</span>
              </div>
            )}
          </div>

          {/* Body card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>Body</span>
            <RichTextEditor
              content={initialAnnouncement?.bodyHtml ?? ''}
              onChange={html => { bodyRef.current = html; }}
              disabled={isSaving}
            />
          </div>

          {/* Pinned/Urgent toggles for new announcements */}
          {!isEditing && (
            <div style={{ display: 'flex', gap: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#45435A', cursor: 'pointer' }}>
                <input type="checkbox" checked={pinned} onChange={e => onPinnedChange(e.target.checked)} disabled={isSaving} />
                Pinned
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#45435A', cursor: 'pointer' }}>
                <input type="checkbox" checked={urgent} onChange={e => onUrgentChange(e.target.checked)} disabled={isSaving} />
                Urgent
              </label>
            </div>
          )}

          {error && (
            <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: '#B91C1C' }}>
              {error}
            </div>
          )}

          {/* Formatting note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8D8B9C' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.5"/>
              <path d="M12 8v4.5l3 1.8"/>
            </svg>
            <span style={{ fontSize: 12.5 }}>Allowed formatting: bold, italic, lists and links — other HTML is stripped when it publishes.</span>
          </div>
        </div>
      </form>
    </>
  );
};

export default AnnouncementComposer;
