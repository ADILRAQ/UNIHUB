/**
 * Filter bar for the announcements feed.
 * Provides urgent and unread toggle buttons.
 */
import type { AnnouncementFilters } from '../types';

interface Props {
  filters: AnnouncementFilters;
  onFilterChange: (next: Partial<AnnouncementFilters>) => void;
}

const FeedFilters = ({ filters, onFilterChange }: Props) => (
  <div className="tabs">
    <button
      type="button"
      className={`tab${filters.urgent ? ' tab--active' : ''}`}
      onClick={() => onFilterChange({ urgent: !filters.urgent || undefined })}
    >
      Urgent only
    </button>
    <button
      type="button"
      className={`tab${filters.unread ? ' tab--active' : ''}`}
      onClick={() => onFilterChange({ unread: !filters.unread || undefined })}
    >
      Unread only
    </button>
  </div>
);

export default FeedFilters;
