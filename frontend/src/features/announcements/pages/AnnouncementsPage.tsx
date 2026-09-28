/**
 * Announcements feed page.
 * All logic is delegated to useFeed; this component is thin UI only.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import useFeed from '../hooks/useFeed';
import AnnouncementCard from '../components/AnnouncementCard';
import PageHeader from '../../../components/layout/PageHeader';
import Tabs from '../../../components/ui/Tabs';

type FeedView = 'all' | 'unread' | 'urgent';

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { announcements, totalPages, page, isLoading, isError, onNextPage, onPrevPage, filters, onFilterChange, unreadCount } = useFeed();

  const canPost = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const view: FeedView = filters.unread ? 'unread' : filters.urgent ? 'urgent' : 'all';
  const onSelectView = (next: FeedView) =>
    onFilterChange({ unread: next === 'unread' || undefined, urgent: next === 'urgent' || undefined });

  return (
    <>
      <PageHeader
        title="Announcements"
        subtitle="Department notices and class group updates"
        actions={canPost ? <Link to="/announcements/new" className="btn btn--primary">New announcement</Link> : undefined}
      />

      <div className="page-body" style={{ maxWidth: 880 }}>
        <Tabs
          tabs={[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'urgent', label: 'Urgent' },
          ]}
          active={view}
          onSelect={onSelectView}
          label="Filter announcements"
        />

        {isError && <div role="alert" className="alert">Failed to load announcements. Please try again.</div>}

        {!isError && (
          // Keyed by filter + page so each list swap fades/slides in instead of cutting.
          <div key={`${view}-${page}-${isLoading ? 'loading' : 'ready'}`} className="enter-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isLoading && [0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 150, borderRadius: 'var(--radius-lg)' }} />)}

            {!isLoading && announcements.length === 0 && (
              <div className="empty-state">
                <h2 className="empty-state__title">
                  {view === 'unread' ? "You're all caught up" : view === 'urgent' ? 'No urgent announcements' : 'No announcements yet'}
                </h2>
                <p className="empty-state__body">
                  {view === 'all' ? 'New posts from your teachers and the department will show up here.' : 'Switch back to All to see every announcement.'}
                </p>
              </div>
            )}

            {!isLoading && announcements.map((item) => (
              <AnnouncementCard key={item.id} item={item} onClick={() => navigate(`/announcements/${item.id}`)} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <button type="button" className="btn" onClick={onPrevPage} disabled={page === 0}>Previous</button>
            <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>Page {page + 1} of {totalPages}</span>
            <button type="button" className="btn" onClick={onNextPage} disabled={page >= totalPages - 1}>Next</button>
          </div>
        )}
      </div>
    </>
  );
};

export default AnnouncementsPage;
