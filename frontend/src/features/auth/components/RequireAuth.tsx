import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

/**
 * Route guard for the authenticated area.
 *
 * - Not authenticated (no valid, unexpired token) -> redirect to `/login`.
 * - Authenticated but flagged `mustChangePassword` and not already on
 *   `/change-password` -> redirect there. This is the forced-redirect mechanic:
 *   a flagged user cannot navigate anywhere else until they change their
 *   password (the backend also enforces it with a 403, this makes the UX clean).
 * - Otherwise render the nested routes.
 */
const RequireAuth = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
