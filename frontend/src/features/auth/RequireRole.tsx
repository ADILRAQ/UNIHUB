import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { homePathForRole } from './roleHome';
import type { Role } from './types';

interface RequireRoleProps {
  allowed: Role[];
}

/**
 * Role guard for a route subtree. Assumes it is nested inside `RequireAuth`, so
 * a user is always present. If the user's role is not in `allowed`, redirect to
 * their own role home rather than showing a section they may not access.
 */
const RequireRole = ({ allowed }: RequireRoleProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
};

export default RequireRole;
