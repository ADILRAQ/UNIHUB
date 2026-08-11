/**
 * Logic hook for the Past Sessions tab on the CoursePage.
 * Fetches past sessions for a given course via GET /api/courses/{courseId}/sessions?past=true.
 */
import useGetData from '../../../hooks/useGetData';
import { getCoursePastSessions } from '../services/recapService';
import type { SessionSummary } from '../types';

interface UsePastSessionsTabReturn {
  sessions: SessionSummary[];
  isLoading: boolean;
  isError: boolean;
}

const usePastSessionsTab = (courseId: number): UsePastSessionsTabReturn => {
  const { data, isLoading, isError } = useGetData<
    SessionSummary[],
    string | number,
    SessionSummary[]
  >({
    queryKey: ['course-past-sessions', courseId],
    queryFn: () => getCoursePastSessions(courseId),
    transformFn: (d) => d,
    enabled: courseId > 0,
  });

  return {
    sessions: data ?? [],
    isLoading,
    isError,
  };
};

export default usePastSessionsTab;
