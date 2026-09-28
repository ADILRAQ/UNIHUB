/**
 * Announcement detail view.
 * Renders server-sanitized bodyHtml and the comments thread. Authors and admins
 * also get Pin / Urgent toggles (edit and delete live in the page header).
 */
import CommentsThread from './CommentsThread';
import type { AnnouncementDto } from '../types';

interface Props {
  announcement: AnnouncementDto;
  canManage: boolean;
  canPin: boolean;
  onTogglePin: () => void;
  onToggleUrgent: () => void;
  currentUserId: number;
  currentUserRole: string;
}

const getInitials = (name: string) =>
  name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const AnnouncementDetail = ({ announcement, canManage, canPin, onTogglePin, onToggleUrgent, currentUserId, currentUserRole }: Props) => (
  <>
    <article className="card" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <span className="badge badge--neutral">{announcement.classGroupName ?? 'Department'}</span>
        {announcement.pinned && <span className="badge badge--warning">Pinned</span>}
        {announcement.urgent && <span className="badge badge--danger">Urgent</span>}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <span style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)', background: 'var(--orange-100)', color: 'var(--orange-700)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
            {getInitials(announcement.authorName)}
          </span>
          <span style={{ fontSize: 13, color: 'var(--ink-700)', fontWeight: 600 }}>{announcement.authorName}</span>
          <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>
            · {formatDate(announcement.createdAt)}{announcement.editedAt && ' (edited)'}
          </span>
        </span>
      </div>

      {/* Server-sanitized HTML from backend — safe per CLAUDE.md */}
      <div className="prose" style={{ fontSize: 16 }} dangerouslySetInnerHTML={{ __html: announcement.bodyHtml }} />

      {canManage && (
        <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {canPin && (
            <button type="button" className={`btn btn--sm${announcement.pinned ? ' btn--active' : ''}`} aria-pressed={announcement.pinned} onClick={onTogglePin}>
              {announcement.pinned ? 'Pinned' : 'Pin to top'}
            </button>
          )}
          <button type="button" className={`btn btn--sm${announcement.urgent ? ' btn--danger' : ''}`} aria-pressed={announcement.urgent} onClick={onToggleUrgent}>
            {announcement.urgent ? 'Marked urgent' : 'Mark urgent'}
          </button>
        </div>
      )}
    </article>

    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className="section-title" style={{ fontSize: 16, lineHeight: '24px' }}>
        {announcement.commentCount} comment{announcement.commentCount !== 1 ? 's' : ''}
      </h2>
      <CommentsThread announcementId={announcement.id} currentUserId={currentUserId} currentUserRole={currentUserRole} />
    </section>
  </>
);

export default AnnouncementDetail;
