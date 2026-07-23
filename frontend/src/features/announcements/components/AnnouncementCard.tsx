/**
 * Announcement card — displayed in the feed list.
 * Unread items are visually accented; pinned/urgent badges are shown.
 */
import type { AnnouncementDto } from '../types';

interface Props {
  item: AnnouncementDto;
  onClick: () => void;
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const AnnouncementCard = ({ item, onClick }: Props) => {
  const cardClasses = [
    'ann-card',
    !item.read ? 'ann-card--unread' : '',
    item.pinned ? 'ann-card--pinned' : '',
    item.urgent ? 'ann-card--urgent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClasses} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}>
      <div className="ann-card__badges">
        {item.pinned && <span className="ann-badge ann-badge--pinned">Pinned</span>}
        {item.urgent && <span className="ann-badge ann-badge--urgent">Urgent</span>}
        {!item.read && <span className="ann-badge ann-badge--unread">New</span>}
      </div>
      <h3 className="ann-card__title">{item.title}</h3>
      <p className="ann-card__meta">
        {item.authorName} &middot;{' '}
        {item.classGroupName ?? 'Department-wide'} &middot;{' '}
        {formatDate(item.createdAt)} &middot;{' '}
        {item.commentCount} comment{item.commentCount !== 1 ? 's' : ''}
      </p>
    </article>
  );
};

export default AnnouncementCard;
