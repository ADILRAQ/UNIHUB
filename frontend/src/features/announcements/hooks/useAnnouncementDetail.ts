/**
 * Logic hook for the announcement detail page.
 * Fetches the announcement and fires a mark-read call on mount.
 */
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../../components/ui/Toast';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import * as announcementService from '../services/announcementService';
import type { AnnouncementDto } from '../types';

interface UseAnnouncementDetailReturn {
  announcement: AnnouncementDto | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Author or admin: may edit, delete and flag urgent. */
  canManage: boolean;
  /** Pinning is admin-only on the backend. */
  canPin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  onTogglePin: () => void;
  onToggleUrgent: () => void;
}

const useAnnouncementDetail = (id: number): UseAnnouncementDetailReturn => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const markedRef = useRef(false);

  const { data: announcement, isLoading, isError } = useGetData<
    AnnouncementDto,
    string | number,
    AnnouncementDto
  >({
    queryKey: ['announcements', id],
    queryFn: () => announcementService.getOne(id),
    transformFn: (d) => d,
  });

  const { mutate: markRead } = usePostData<string | number, number, void>({
    keys: ['announcements', id, 'read'],
    serviceFn: (annId: number) => announcementService.markRead(annId),
    onSuccessFn: () => {
      // Invalidate unread count badge and feed list so they reflect the change.
      void queryClient.invalidateQueries({ queryKey: ['announcements', 'unread-count'] });
      void queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  // Fire mark-read once per mount, regardless of re-renders.
  useEffect(() => {
    if (!markedRef.current && id) {
      markedRef.current = true;
      markRead(id);
    }
  }, [id, markRead]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['announcements'] });
  };

  const { mutate: remove, isPending: isDeleting } = usePostData<string, number, void>({
    keys: ['announcements', 'delete'],
    serviceFn: announcementService.deleteAnnouncement,
    onSuccessFn: () => {
      toast.success('Announcement deleted.');
      invalidate();
      navigate('/announcements');
    },
    onErrorFn: (err) => {
      toast.error((err?.response?.data?.message as string | undefined) ?? 'Failed to delete announcement.');
    },
  });

  const canManage = Boolean(announcement && user && (user.role === 'ADMIN' || announcement.authorId === user.userId));

  const onDelete = () => {
    if (window.confirm('Delete this announcement and its comments? This cannot be undone.')) remove(id);
  };

  const toggleError = (fallback: string) => (err: { response?: { data?: { message?: string } } }) =>
    toast.error(err?.response?.data?.message ?? fallback);

  const { mutate: pin } = usePostData<string | number, boolean, AnnouncementDto>({
    keys: ['announcements', id, 'pin'],
    serviceFn: (pinned) => announcementService.pinAnnouncement(id, pinned),
    onSuccessFn: invalidate,
    onErrorFn: toggleError('Could not update the pin.'),
  });

  const { mutate: flagUrgent } = usePostData<string | number, boolean, AnnouncementDto>({
    keys: ['announcements', id, 'urgent'],
    serviceFn: (urgent) => announcementService.setUrgent(id, urgent),
    onSuccessFn: invalidate,
    onErrorFn: toggleError('Could not update urgency.'),
  });

  const onTogglePin = () => {
    if (announcement) pin(!announcement.pinned);
  };

  const onToggleUrgent = () => {
    if (announcement) flagUrgent(!announcement.urgent);
  };

  return {
    announcement,
    isLoading,
    isError,
    canManage,
    canPin: user?.role === 'ADMIN',
    onEdit: () => navigate(`/announcements/${id}/edit`),
    onDelete,
    isDeleting,
    onTogglePin,
    onToggleUrgent,
  };
};

export default useAnnouncementDetail;
