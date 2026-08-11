/**
 * Logic hook for the session recap view page (all roles).
 * Fetches the recap for the given session and exposes whether the current user
 * can edit it (TEACHER / ADMIN only).
 */
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import useGetData from '../../../hooks/useGetData';
import { getSessionRecap } from '../services/recapService';
import type { SessionRecap } from '../types';

interface UseSessionRecapPageReturn {
  recap: SessionRecap | undefined;
  isLoading: boolean;
  isError: boolean;
  sessionId: number;
  /** courseId forwarded from the query-string (set when navigating from CoursePage). */
  courseId: number | undefined;
  canEdit: boolean;
}

const useSessionRecapPage = (): UseSessionRecapPageReturn => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const id = Number(sessionId);
  const courseIdParam = searchParams.get('courseId');
  const courseId = courseIdParam ? Number(courseIdParam) : undefined;

  const { data: recap, isLoading, isError } = useGetData<
    SessionRecap,
    string | number,
    SessionRecap
  >({
    queryKey: ['recap', id],
    queryFn: () => getSessionRecap(id),
    transformFn: (d) => d,
    enabled: !isNaN(id) && id > 0,
  });

  const canEdit = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  return { recap, isLoading, isError, sessionId: id, courseId, canEdit };
};

export default useSessionRecapPage;
