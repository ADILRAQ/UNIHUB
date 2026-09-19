import { useAuth } from '../../auth/AuthContext';
import type { AuthUser } from '../../auth/types';
import useGetData from '../../../hooks/useGetData';
import apiClient from '../../../api/client';

export interface NextSessionDto {
  sessionId: string;
  courseName: string;
  sessionDate: string; // "YYYY-MM-DD"
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"
  room: string;
  meetUrl: string;
  courseId: string;
}

export interface UseDashboardPage {
  user: AuthUser | null;
  isAdmin: boolean;
  isTeacher: boolean;
  nextSession: NextSessionDto | null | undefined;
}

/**
 * Logic for the dashboard landing page: reads the signed-in user, derives
 * role-based flags, and fetches the student's next upcoming session.
 * Follows the logic-hook/UI split so the page component stays presentation-only.
 */
const useDashboardPage = (): UseDashboardPage => {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';

  const { data: nextSession } = useGetData<NextSessionDto | null, string, NextSessionDto | null>({
    queryKey: ['sessions', 'next'],
    queryFn: () =>
      apiClient.get<NextSessionDto>('/api/sessions/next').then((r) => {
        // 204 No Content: axios returns "" for body-less responses
        const d = r.data as NextSessionDto | '' | null | undefined;
        return d && typeof d === 'object' ? d : null;
      }),
    transformFn: (d) => d,
    enabled: isStudent,
  });

  return {
    user,
    isAdmin: user?.role === 'ADMIN',
    isTeacher: user?.role === 'TEACHER',
    nextSession: isStudent ? (nextSession ?? null) : null,
  };
};

export default useDashboardPage;
