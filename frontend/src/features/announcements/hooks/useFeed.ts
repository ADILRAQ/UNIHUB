/**
 * Logic hook for the announcements feed page.
 * Handles pagination, filters, and unread-count badge.
 */
import { useState } from 'react';
import useGetData from '../../../hooks/useGetData';
import * as announcementService from '../services/announcementService';
import type { AnnouncementDto, AnnouncementFilters } from '../types';
import type { PagedResponse } from '../../../api/types';

interface UseFeedReturn {
  announcements: AnnouncementDto[];
  totalPages: number;
  page: number;
  isLoading: boolean;
  isError: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  filters: AnnouncementFilters;
  onFilterChange: (next: Partial<AnnouncementFilters>) => void;
  unreadCount: number;
}

const useFeed = (): UseFeedReturn => {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<AnnouncementFilters>({});

  const { data, isLoading, isError } = useGetData<
    PagedResponse<AnnouncementDto>,
    string | number | boolean | undefined,
    PagedResponse<AnnouncementDto>
  >({
    queryKey: [
      'announcements',
      page,
      filters.classGroupId,
      filters.urgent,
      filters.unread,
    ],
    queryFn: () => announcementService.getPage({ page, filters }),
    transformFn: (d) => d,
  });

  const { data: unreadData } = useGetData<
    { count: number },
    string,
    number
  >({
    queryKey: ['announcements', 'unread-count'],
    queryFn: () => announcementService.getUnreadCount(),
    transformFn: (d) => d.count,
  });

  const onNextPage = () => {
    if (data && page < data.totalPages - 1) {
      setPage((p) => p + 1);
    }
  };

  const onPrevPage = () => {
    if (page > 0) {
      setPage((p) => p - 1);
    }
  };

  const onFilterChange = (next: Partial<AnnouncementFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(0); // reset to first page on filter change
  };

  return {
    announcements: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    page,
    isLoading,
    isError,
    onNextPage,
    onPrevPage,
    filters,
    onFilterChange,
    unreadCount: unreadData ?? 0,
  };
};

export default useFeed;
