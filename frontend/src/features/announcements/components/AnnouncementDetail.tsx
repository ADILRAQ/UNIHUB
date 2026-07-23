/**
 * Announcement detail view.
 * Renders server-sanitized bodyHtml safely and shows the comments thread.
 * For authors and admins also shows Edit, Pin, and Urgent controls.
 */
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import CommentsThread from './CommentsThread';
import * as announcementService from '../services/announcementService';
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
}: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAdmin = currentUserRole === 'ADMIN';
  const isAuthor = announcement.authorId === currentUserId;
  const canEdit = isAdmin || isAuthor;
  const canToggle = isAdmin || (currentUserRole === 'TEACHER' && isAuthor);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['announcements', announcement.id] });
    void queryClient.invalidateQueries({ queryKey: ['announcements'] });
  };

  const handlePin = () => {
    void announcementService
      .pinAnnouncement(announcement.id, !announcement.pinned)
      .then(invalidate);
  };

  const handleUrgent = () => {
    void announcementService
      .setUrgent(announcement.id, !announcement.urgent)
      .then(invalidate);
  };

  return (
    <article className="ann-detail">
      <div className="ann-detail__toolbar">
        <button type="button" className="ann-detail__back" onClick={onBack}>
          &larr; Back
        </button>

        {canEdit && (
          <button
            type="button"
            className="ann-btn ann-btn--sm"
            onClick={() => navigate(`/announcements/${announcement.id}/edit`)}
          >
            Edit
          </button>
        )}
        {canToggle && (
          <>
            <button
              type="button"
              className={`ann-btn ann-btn--sm${announcement.pinned ? ' ann-btn--active' : ''}`}
              onClick={handlePin}
              title={announcement.pinned ? 'Unpin' : 'Pin'}
            >
              {announcement.pinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              type="button"
              className={`ann-btn ann-btn--sm${announcement.urgent ? ' ann-btn--active' : ''}`}
              onClick={handleUrgent}
              title={announcement.urgent ? 'Mark not urgent' : 'Mark urgent'}
            >
              {announcement.urgent ? 'Not urgent' : 'Urgent'}
            </button>
          </>
        )}
      </div>

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
};

export default AnnouncementDetail;
