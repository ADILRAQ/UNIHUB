/**
 * Announcements feed page.
 * All logic is delegated to useFeed; this component is thin UI only.
 */
import { useNavigate } from 'react-router-dom';
import useFeed from '../hooks/useFeed';
import AnnouncementCard from '../components/AnnouncementCard';
import FeedFilters from '../components/FeedFilters';

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  const {
    announcements,
    totalPages,
    page,
    isLoading,
    isError,
    onNextPage,
    onPrevPage,
    filters,
    onFilterChange,
  } = useFeed();

  return (
    <div className="ann-feed">
      <h2 className="ann-feed__heading">Announcements</h2>

      <FeedFilters filters={filters} onFilterChange={onFilterChange} />

      {isLoading && <p className="ann-feed__state">Loading announcements&hellip;</p>}

      {isError && (
        <p className="ann-feed__state ann-feed__state--error">
          Failed to load announcements. Please try again.
        </p>
      )}

      {!isLoading && !isError && announcements.length === 0 && (
        <p className="ann-feed__state">No announcements found.</p>
      )}

      <div className="ann-feed__list">
        {announcements.map((item) => (
          <AnnouncementCard
            key={item.id}
            item={item}
            onClick={() => navigate(`/announcements/${item.id}`)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="ann-pagination">
          <button type="button" onClick={onPrevPage} disabled={page === 0}>
            Previous
          </button>
          <span>
            Page {page + 1} / {totalPages}
          </span>
          <button type="button" onClick={onNextPage} disabled={page >= totalPages - 1}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
