/**
 * Announcement detail page.
 * Reads the id param, delegates to useAnnouncementDetail, renders AnnouncementDetail.
 */
import { useParams } from 'react-router-dom';
import useAnnouncementDetail from '../hooks/useAnnouncementDetail';
import { useAuth } from '../../auth/AuthContext';
import PageHeader from '../../../components/layout/PageHeader';
import AnnouncementDetail from '../components/AnnouncementDetail';

const AnnouncementDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const d = useAnnouncementDetail(Number(id));

  const headerActions = d.canManage ? (
    <>
      <button type="button" className="btn" onClick={d.onEdit}>Edit</button>
      <button type="button" className="btn btn--danger" onClick={d.onDelete} disabled={d.isDeleting}>
        {d.isDeleting ? 'Deleting…' : 'Delete'}
      </button>
    </>
  ) : undefined;

  return (
    <>
      <PageHeader
        title={d.announcement?.title ?? 'Announcement'}
        breadcrumb="All announcements"
        breadcrumbTo="/announcements"
        actions={headerActions}
      />

      <div className="page-body" style={{ maxWidth: 824 }}>
        {d.isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="skeleton" style={{ height: 24, width: 120 }} />
            <div className="skeleton" style={{ height: 16, width: '50%' }} />
            <div className="skeleton" style={{ height: 160, marginTop: 8 }} />
          </div>
        )}

        {d.isError && (
          <div role="alert" className="alert">Announcement not found or you do not have permission to view it.</div>
        )}

        {!d.isLoading && !d.isError && d.announcement && (
          <AnnouncementDetail
            announcement={d.announcement}
            canManage={d.canManage}
            onTogglePin={d.onTogglePin}
            onToggleUrgent={d.onToggleUrgent}
            currentUserId={user?.userId ?? 0}
            currentUserRole={user?.role ?? ''}
          />
        )}
      </div>
    </>
  );
};

export default AnnouncementDetailPage;
