import { useAuth } from '../../auth/AuthContext';

export interface UsePaymentsPage {
  viewType: 'student' | 'admin';
}

/**
 * Derives the view type for the payments page from the signed-in user's role.
 * Students see their own installments; admins and teachers see the admin console.
 */
const usePaymentsPage = (): UsePaymentsPage => {
  const { user } = useAuth();
  const viewType = user?.role === 'STUDENT' ? 'student' : 'admin';
  return { viewType };
};

export default usePaymentsPage;
