/**
 * Announcement detail view.
 * Renders server-sanitized bodyHtml safely and shows the comments thread.
 */
import CommentsThread from './CommentsThread';
import type { AnnouncementDto } from '../types';

interface Props {
  announcement: AnnouncementDto;
  onBack: () => void;
  currentUserId: number;
  currentUserRole: string;
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const AnnouncementDetail = ({
  announcement,
  onBack,
  currentUserId,
  currentUserRole,
}: Props) => (
  <article className="ann-detail">
    <button type="button" className="ann-detail__back" onClick={onBack}>
      &larr; Back
    </button>

    <div className="ann-card__badges">
      {announcement.pinned && (
        <span className="ann-badge ann-badge--pinned">Pinned</span>
      )}
      {announcement.urgent && (
        <span className="ann-badge ann-badge--urgent">Urgent</span>
      )}
    </div>

    <h2 className="ann-detail__title">{announcement.title}</h2>

    <p className="ann-detail__meta">
      <strong>{announcement.authorName}</strong> &middot;{' '}
      {announcement.classGroupName ?? 'Department-wide'} &middot;{' '}
      {formatDate(announcement.createdAt)}
      {announcement.editedAt && (
        <span className="ann-detail__edited">
          {' '}(edited {formatDate(announcement.editedAt)})
        </span>
      )}
    </p>

    {/* bodyHtml is sanitized server-side with Jsoup — safe to render directly */}
    <div
      className="ann-body"
      dangerouslySetInnerHTML={{ __html: announcement.bodyHtml }}
    />

    <CommentsThread
      announcementId={announcement.id}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
    />
  </article>
);

export default AnnouncementDetail;
