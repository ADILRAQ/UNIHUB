/**
 * Create / edit form for announcements (teacher + admin only) — artboard design.
 * Thin UI: delegates all state/logic to useComposer.
 */
import { useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import PageHeader from '../../../components/layout/PageHeader';
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
    error,
    isEditing,
    availableGroups,
    isLoadingGroups,
    onTitleChange,
    onGroupChange,
    onPinnedChange,
    onUrgentChange,
    onSubmit,
  } = useComposer({ initialAnnouncement });

  const role = user?.role ?? '';
  const showGroupSelector = role === 'ADMIN' || (role === 'TEACHER' && availableGroups.length > 1);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(bodyRef.current);
  };

  return (
    <>
      <PageHeader
        title={isEditing ? 'Edit announcement' : 'New announcement'}
        breadcrumb="All announcements"
        breadcrumbTo="/announcements"
        actions={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)} disabled={isSaving}>Cancel</button>
            <button type="submit" form="ann-composer-form" className="btn btn--primary" disabled={isSaving}>
              {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Publish'}
            </button>
          </>
        }
      />

      <form id="ann-composer-form" onSubmit={handleSubmit} noValidate className="page-body" style={{ maxWidth: 824 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Title + group card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="ann-title" className="label">Title</label>
              <input
                id="ann-title"
                type="text"
                placeholder="e.g. Midterm exam schedule"
                value={title}
                onChange={e => onTitleChange(e.target.value)}
                required
                disabled={isSaving}
                className="input"
                style={{ fontSize: 16 }}
              />
            </div>

            {showGroupSelector && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="ann-group-select" className="label">Class group</label>
                {isLoadingGroups ? (
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-500)' }}>Loading groups…</p>
                ) : (
                  <select
                      id="ann-group-select"
                      value={classGroupId ?? ''}
                      onChange={e => onGroupChange(e.target.value === '' ? null : Number(e.target.value))}
                      disabled={isSaving}
                      className="select"
                    >
                      {role === 'ADMIN' && <option value="">All class groups</option>}
                      {availableGroups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                )}
                <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>Only students and teachers in this group will see the post &mdash; pick &ldquo;All class groups&rdquo; for department-wide notices.</span>
              </div>
            )}
          </div>

          {/* Body card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="label">Body</span>
            <RichTextEditor
              content={initialAnnouncement?.bodyHtml ?? ''}
              onChange={html => { bodyRef.current = html; }}
              disabled={isSaving}
            />
          </div>

          {/* Pinned/Urgent toggles for new announcements */}
          {!isEditing && (
            <div style={{ display: 'flex', gap: 20 }}>
              <label className="sched-check">
                <input type="checkbox" checked={pinned} onChange={e => onPinnedChange(e.target.checked)} disabled={isSaving} />
                Pin to top
              </label>
              <label className="sched-check">
                <input type="checkbox" checked={urgent} onChange={e => onUrgentChange(e.target.checked)} disabled={isSaving} />
                Mark urgent
              </label>
            </div>
          )}

          {error && (
            <div role="alert" className="alert">
              {error}
            </div>
          )}

          {/* Formatting note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-500)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.5"/>
              <path d="M12 8v4.5l3 1.8"/>
            </svg>
            <span style={{ fontSize: 12 }}>Allowed formatting: bold, italic, lists and links — other HTML is stripped when it publishes.</span>
          </div>
        </div>
      </form>
    </>
  );
};

export default AnnouncementComposer;
