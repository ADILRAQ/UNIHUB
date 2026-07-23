import apiClient from '../../../api/client';
import type { CreateEventRequest, EventItem, UpdateEventRequest } from '../types';
import type { ScheduleRange } from './scheduleService';

/**
 * Service functions for one-off events. Reads are open to any authenticated
 * caller (scoped per-role server-side); create is ADMIN or TEACHER (teacher only
 * for their own course); update/delete are admin or the owning teacher. All HTTP
 * through the shared typed `apiClient`.
 */

export const listEvents = ({ from, to }: ScheduleRange): Promise<EventItem[]> =>
  apiClient
    .get<EventItem[]>('/api/events', { params: { from, to } })
    .then((response) => response.data);

export const createEvent = (body: CreateEventRequest): Promise<EventItem> =>
  apiClient.post<EventItem>('/api/events', body).then((response) => response.data);

export const updateEvent = ({
  id,
  ...body
}: { id: number } & UpdateEventRequest): Promise<EventItem> =>
  apiClient.patch<EventItem>(`/api/events/${id}`, body).then((response) => response.data);

export const deleteEvent = (id: number): Promise<void> =>
  apiClient.delete(`/api/events/${id}`).then(() => undefined);
