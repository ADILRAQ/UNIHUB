/**
 * Announcement detail page.
 * Reads the id param, delegates to useAnnouncementDetail, renders AnnouncementDetail.
 */
import { useNavigate, useParams } from 'react-router-dom';
import useAnnouncementDetail from '../hooks/useAnnouncementDetail';
import { useAuth } from '../../auth/AuthContext';
import PageHeader from '../../../components/layout/PageHeader';
import AnnouncementDetail from '../components/AnnouncementDetail';

const AnnouncementDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const announcementId = Number(id);
  const { announcement, isLoading, isError } = useAnnouncementDetail(announcementId);

  const canEdit = user?.role === 'ADMIN' || (announcement && announcement.authorId === user?.userId);

  const headerActions = canEdit && announcement ? (
    <button
      type="button"
      onClick={() => navigate(`/announcements/${announcement.id}/edit`)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px', border: '1px solid #E1DEF2', borderRadius: 10, background: '#FFFFFF', color: '#45435A', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17V20Z"/>
      </svg>
      Edit
    </button>
  ) : undefined;

  return (
    <>
      <PageHeader
        title="Announcements"
        breadcrumb="Announcements"
        breadcrumbTo="/announcements"
        actions={headerActions}
      />

      <main style={{ flexGrow: 1, boxSizing: 'border-box', padding: '40px 32px 60px', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="skeleton" style={{ height: 28, borderRadius: 999, width: 100 }} />
              <div className="skeleton" style={{ height: 36, width: '70%' }} />
              <div className="skeleton" style={{ height: 16, width: '50%' }} />
              <div className="skeleton" style={{ height: 120, marginTop: 8 }} />
            </div>
          )}

          {isError && (
            <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: '#B91C1C' }}>
              Announcement not found or you do not have permission to view it.
            </div>
          )}

          {!isLoading && !isError && announcement && (
            <AnnouncementDetail
              announcement={announcement}
              onBack={() => navigate(-1)}
              currentUserId={user?.userId ?? 0}
              currentUserRole={user?.role ?? ''}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default AnnouncementDetailPage;
