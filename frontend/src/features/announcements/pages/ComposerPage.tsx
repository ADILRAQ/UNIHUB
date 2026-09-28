/**
 * Composer page — thin shell for create and edit flows.
 *
 * /announcements/new        → no params, renders a blank composer
 * /announcements/:id/edit   → fetches the announcement, passes it to the composer
 */
import { useParams } from 'react-router-dom';
import AnnouncementComposer from '../components/AnnouncementComposer';
import useAnnouncementDetail from '../hooks/useAnnouncementDetail';

/** Wrapper used only in edit mode to load the existing announcement. */
const EditComposer = ({ id }: { id: number }) => {
  const { announcement, isLoading, isError } = useAnnouncementDetail(id);

  if (isLoading) {
    return <div className="page-body"><div className="skeleton" style={{ height: 320 }} /></div>;
  }

  if (isError || !announcement) {
    return (
      <div className="page-body">
        <p className="alert" role="alert">Announcement not found or you do not have permission to edit it.</p>
      </div>
    );
  }

  return <AnnouncementComposer initialAnnouncement={announcement} />;
};

const ComposerPage = () => {
  const { id } = useParams<{ id?: string }>();

  if (id) {
    const numericId = Number(id);
    return <EditComposer id={numericId} />;
  }

  return <AnnouncementComposer />;
};

export default ComposerPage;
