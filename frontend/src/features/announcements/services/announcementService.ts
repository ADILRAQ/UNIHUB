/**
 * Announcement API service. All calls go through the shared typed `apiClient`;
 * JWT is attached automatically by the request interceptor.
 */
import apiClient from '../../../api/client';
import type { PagedResponse } from '../../../api/types';
import type {
  AnnouncementDto,
  AnnouncementFilters,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '../types';

export interface GetPageParams {
  page: number;
  size?: number;
  filters?: AnnouncementFilters;
}

/** GET /api/announcements?page=P&size=20[&classGroupId=X][&urgent=true][&unread=true] */
export const getPage = ({
  page,
  size = 20,
  filters = {},
}: GetPageParams): Promise<PagedResponse<AnnouncementDto>> =>
  apiClient
    .get<PagedResponse<AnnouncementDto>>('/api/announcements', {
      params: {
        page,
        size,
        classGroupId: filters.classGroupId ?? undefined,
        urgent: filters.urgent === true ? true : undefined,
        unread: filters.unread === true ? true : undefined,
      },
    })
    .then((r) => r.data);

/** GET /api/announcements/{id} */
export const getOne = (id: number): Promise<AnnouncementDto> =>
  apiClient
    .get<AnnouncementDto>(`/api/announcements/${id}`)
    .then((r) => r.data);

/** POST /api/announcements/{id}/read — 204 No Content */
export const markRead = (id: number): Promise<void> =>
  apiClient
    .post<void>(`/api/announcements/${id}/read`)
    .then(() => undefined);

/** GET /api/announcements/unread-count → { count: number } */
export const getUnreadCount = (): Promise<{ count: number }> =>
  apiClient
    .get<{ count: number }>('/api/announcements/unread-count')
    .then((r) => r.data);

/** POST /api/announcements */
export const createAnnouncement = (
  data: CreateAnnouncementRequest,
): Promise<AnnouncementDto> =>
  apiClient
    .post<AnnouncementDto>('/api/announcements', data)
    .then((r) => r.data);

/** PATCH /api/announcements/{id} */
export const updateAnnouncement = (
  id: number,
  data: UpdateAnnouncementRequest,
): Promise<AnnouncementDto> =>
  apiClient
    .patch<AnnouncementDto>(`/api/announcements/${id}`, data)
    .then((r) => r.data);

/** PATCH /api/announcements/{id}/pin */
export const pinAnnouncement = (
  id: number,
  pinned: boolean,
): Promise<AnnouncementDto> =>
  apiClient
    .patch<AnnouncementDto>(`/api/announcements/${id}/pin`, { pinned })
    .then((r) => r.data);

/** PATCH /api/announcements/{id}/urgent */
export const setUrgent = (
  id: number,
  urgent: boolean,
): Promise<AnnouncementDto> =>
  apiClient
    .patch<AnnouncementDto>(`/api/announcements/${id}/urgent`, { urgent })
    .then((r) => r.data);

/** DELETE /api/announcements/{id} */
export const deleteAnnouncement = (id: number): Promise<void> =>
  apiClient
    .delete<void>(`/api/announcements/${id}`)
    .then(() => undefined);
