import { useAuth } from '../../auth/AuthContext';
import type { AuthUser } from '../../auth/types';

export interface UseDashboardPage {
  user: AuthUser | null;
  isAdmin: boolean;
  isTeacher: boolean;
}

/**
 * Logic for the dashboard landing page: reads the signed-in user and derives
 * role-based flags used to personalise the UI. Follows the logic-hook/UI split
 * so the page component stays presentation-only.
 */
const useDashboardPage = (): UseDashboardPage => {
  const { user } = useAuth();

  return {
    user,
    isAdmin: user?.role === 'ADMIN',
    isTeacher: user?.role === 'TEACHER',
  };
};

export default useDashboardPage;
