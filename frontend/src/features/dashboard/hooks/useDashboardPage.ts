import { useAuth } from '../../auth/AuthContext';
import type { AuthUser } from '../../auth/types';
import useGetData from '../../../hooks/useGetData';
import apiClient from '../../../api/client';
import { getQueue } from '../../payments/services/paymentService';
import type { PendingProofItemDto } from '../../payments/types';
import { getPage } from '../../announcements/services/announcementService';
import type { AnnouncementDto } from '../../announcements/types';

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
  pendingProofCount: number;
  latestAnnouncements: AnnouncementDto[];
  announcementsLoading: boolean;
}

/**
 * Logic for the dashboard landing page: reads the signed-in user, derives
 * role-based flags, and fetches the student's next upcoming session.
 * Follows the logic-hook/UI split so the page component stays presentation-only.
 */
const useDashboardPage = (): UseDashboardPage => {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

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

  // Fetch pending proof queue count for admin/teacher banner
  const { data: pendingQueue } = useGetData<PendingProofItemDto[], string, PendingProofItemDto[]>({
    queryKey: ['payments', 'queue', 'dashboard'],
    queryFn: getQueue,
    transformFn: (d) => d,
    enabled: isAdminOrTeacher,
  });

  const { data: latestAnnouncements, isLoading: announcementsLoading } = useGetData({
    queryKey: ['announcements', 'latest'],
    queryFn: () => getPage({ page: 0, size: 4 }),
    transformFn: (d) => d.content,
  });

  return {
    user,
    isAdmin: user?.role === 'ADMIN',
    isTeacher: user?.role === 'TEACHER',
    nextSession: isStudent ? (nextSession ?? null) : null,
    pendingProofCount: pendingQueue?.length ?? 0,
    latestAnnouncements: latestAnnouncements ?? [],
    announcementsLoading,
  };
};

export default useDashboardPage;
