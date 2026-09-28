/**
 * Announcement card — displayed in the feed list.
 * Unread items get a peach wash and a "New" tag; pinned/urgent get status pills.
 */
import type { AnnouncementDto } from '../types';

interface Props {
  item: AnnouncementDto;
  onClick: () => void;
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// Plain-text preview of the (server-sanitized) body; rendered as text, never as HTML.
const excerpt = (html: string, max = 200): string => {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

const AnnouncementCard = ({ item, onClick }: Props) => {
  const cardClasses = ['ann-card', !item.read ? 'ann-card--unread' : '', item.pinned ? 'ann-card--pinned' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={cardClasses}
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      <div className="ann-card__badges">
        {!item.read && <span className="badge badge--new">New</span>}
        <span className="badge badge--neutral">{item.classGroupName ?? 'Department'}</span>
        {item.pinned && <span className="badge badge--warning">Pinned</span>}
        {item.urgent && <span className="badge badge--danger">Urgent</span>}
      </div>
      <h3 className="ann-card__title">{item.title}</h3>
      <p style={{ margin: '0 0 var(--space-3)', fontSize: 14, lineHeight: 1.6, color: 'var(--ink-600)' }}>{excerpt(item.bodyHtml)}</p>
      <p className="ann-card__meta">
        {item.authorName} · {formatDate(item.createdAt)} · {item.commentCount} comment{item.commentCount !== 1 ? 's' : ''}
      </p>
    </article>
  );
};

export default AnnouncementCard;
