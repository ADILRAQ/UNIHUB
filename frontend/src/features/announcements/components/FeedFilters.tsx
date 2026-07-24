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
  <div className="ann-filters">
    <button
      type="button"
      className={`ann-filter-btn${filters.urgent ? ' ann-filter-btn--active' : ''}`}
      onClick={() => onFilterChange({ urgent: !filters.urgent || undefined })}
    >
      Urgent only
    </button>
    <button
      type="button"
      className={`ann-filter-btn${filters.unread ? ' ann-filter-btn--active' : ''}`}
      onClick={() => onFilterChange({ unread: !filters.unread || undefined })}
    >
      Unread only
    </button>
  </div>
);

export default FeedFilters;
