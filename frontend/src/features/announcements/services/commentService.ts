/**
 * Comment API service. All calls go through the shared typed `apiClient`;
 * JWT is attached automatically by the request interceptor.
 */
import apiClient from '../../../api/client';
import type { PagedResponse } from '../../../api/types';
import type { CommentDto } from '../types';

/** GET /api/announcements/{id}/comments?page=P&size=20 */
export const listComments = (
  announcementId: number,
  page: number,
  size = 20,
): Promise<PagedResponse<CommentDto>> =>
  apiClient
    .get<PagedResponse<CommentDto>>(
      `/api/announcements/${announcementId}/comments`,
      { params: { page, size } },
    )
    .then((r) => r.data);

export interface AddCommentParams {
  announcementId: number;
  content: string;
}

/** POST /api/announcements/{id}/comments — 201 Created */
export const addComment = ({
  announcementId,
  content,
}: AddCommentParams): Promise<CommentDto> =>
  apiClient
    .post<CommentDto>(`/api/announcements/${announcementId}/comments`, {
      content,
    })
    .then((r) => r.data);

export interface DeleteCommentParams {
  announcementId: number;
  commentId: number;
}

/** DELETE /api/announcements/{id}/comments/{cid} — 204 No Content */
export const deleteComment = ({
  announcementId,
  commentId,
}: DeleteCommentParams): Promise<void> =>
  apiClient
    .delete<void>(
      `/api/announcements/${announcementId}/comments/${commentId}`,
    )
    .then(() => undefined);
