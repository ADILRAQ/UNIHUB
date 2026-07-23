import apiClient from '../../../api/client';
import type { CancelSessionRequest, RescheduleSessionRequest, Session } from '../types';

/**
 * Service functions for session exceptions (admin or owning teacher, enforced
 * server-side). Reschedule can reject onto a normal class day (400) or an
 * occupied slot (409); callers surface those messages via `apiErrorMessage`.
 */

export const cancelSession = ({
  id,
  ...body
}: { id: number } & CancelSessionRequest): Promise<Session> =>
  apiClient
    .patch<Session>(`/api/sessions/${id}/cancel`, body)
    .then((response) => response.data);

export const rescheduleSession = ({
  id,
  ...body
}: { id: number } & RescheduleSessionRequest): Promise<Session> =>
  apiClient
    .patch<Session>(`/api/sessions/${id}/reschedule`, body)
    .then((response) => response.data);
