/**
 * Logic hook for the announcement detail page.
 * Fetches the announcement and fires a mark-read call on mount.
 */
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import * as announcementService from '../services/announcementService';
import type { AnnouncementDto } from '../types';

interface UseAnnouncementDetailReturn {
  announcement: AnnouncementDto | undefined;
  isLoading: boolean;
  isError: boolean;
}

const useAnnouncementDetail = (id: number): UseAnnouncementDetailReturn => {
  const queryClient = useQueryClient();
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

  return { announcement, isLoading, isError };
};

export default useAnnouncementDetail;
