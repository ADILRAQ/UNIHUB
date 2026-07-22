import { useAuth } from '../../auth/AuthContext';
import type { AuthUser } from '../../auth/types';

export interface UseDashboardPage {
  user: AuthUser | null;
  isAdmin: boolean;
}

/**
 * Logic for the dashboard landing page: reads the signed-in user and derives
 * whether the admin-area link should show. Trivial today, but follows the
 * logic-hook/UI split so the page component stays presentation-only.
 */
const useDashboardPage = (): UseDashboardPage => {
  const { user } = useAuth();

  return {
    user,
    isAdmin: user?.role === 'ADMIN',
  };
};

export default useDashboardPage;
