import useGetData from '../../../hooks/useGetData';
import { getSchedule } from '../services/scheduleService';
import type { ScheduleItem } from '../types';

/** Shared query-key prefix for the schedule feed, so mutations can invalidate it. */
export const SCHEDULE_KEY = ['schedule'] as const;

export interface UseSchedule {
  items: ScheduleItem[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Reusable read hook for the merged schedule feed over an ISO date range. Keyed on
 * `from`/`to` so each range caches independently; composes the generic `useGetData`
 * (never `useQuery` directly). Consumed by the calendar's Today/Week/Month views.
 */
const useSchedule = (from: string, to: string, enabled = true): UseSchedule => {
  const { data, isLoading, isError } = useGetData<ScheduleItem[], string, ScheduleItem[]>({
    queryKey: [...SCHEDULE_KEY, from, to],
    queryFn: () => getSchedule({ from, to }),
    transformFn: (items) => items,
    enabled,
  });

  return {
    items: data ?? [],
    isLoading,
    isError,
  };
};

export default useSchedule;
