/**
 * Announcement detail page.
 * Reads the id param, delegates to useAnnouncementDetail, renders AnnouncementDetail.
 */
import { useNavigate, useParams } from 'react-router-dom';
import useAnnouncementDetail from '../hooks/useAnnouncementDetail';
import AnnouncementDetail from '../components/AnnouncementDetail';
import { useAuth } from '../../auth/AuthContext';

const AnnouncementDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const announcementId = Number(id);
  const { announcement, isLoading, isError } = useAnnouncementDetail(announcementId);

  if (isLoading) {
    return <p className="ann-feed__state">Loading&hellip;</p>;
  }

  if (isError || !announcement) {
    return (
      <p className="ann-feed__state ann-feed__state--error">
        Announcement not found or you do not have permission to view it.
      </p>
    );
  }

  return (
    <AnnouncementDetail
      announcement={announcement}
      onBack={() => navigate(-1)}
      currentUserId={user?.userId ?? 0}
      currentUserRole={user?.role ?? ''}
    />
  );
};

export default AnnouncementDetailPage;
