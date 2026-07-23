import apiClient from '../../../api/client';
import type { ScheduleItem } from '../types';

/**
 * Service for the merged schedule feed. Goes through the shared typed `apiClient`
 * (JWT attached automatically) and is consumed by the calendar logic hooks via
 * the generic `useGetData` wrapper.
 */

export interface ScheduleRange {
  /** Inclusive ISO start date, e.g. `"2026-08-01"`. */
  from: string;
  /** Inclusive ISO end date, e.g. `"2026-08-31"`. */
  to: string;
}

/** `GET /api/schedule?from=&to=` — the caller's sessions + events, sorted. */
export const getSchedule = ({ from, to }: ScheduleRange): Promise<ScheduleItem[]> =>
  apiClient
    .get<ScheduleItem[]>('/api/schedule', { params: { from, to } })
    .then((response) => response.data);
