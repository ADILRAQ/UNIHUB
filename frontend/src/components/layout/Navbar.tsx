import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import useGetData from '../../hooks/useGetData';
import { getUnreadCount } from '../../features/announcements/services/announcementService';

/**
 * Top bar for the authenticated area (rendered inside `RequireAuth` via
 * `BaseLayout`, so a user is always present). Shows the signed-in user's name
 * and role, nav links for all roles (Announcements), role-scoped links
 * (Admin console for ADMINs), and a logout button.
 */
const Navbar = () => {
  const { user, logout } = useAuth();

  const { data: unreadCount } = useGetData<{ count: number }, string, number>({
    queryKey: ['announcements', 'unread-count'],
    queryFn: getUnreadCount,
    transformFn: (d) => d.count,
    enabled: !!user,
  });

  return (
    <header className="navbar">
      <Link to="/" className="navbar__title">
        UniHub
      </Link>
      <nav className="navbar__nav" aria-label="Main navigation">
        <Link to="/announcements" className="navbar__link navbar__link--with-badge">
          Announcements
          {!!unreadCount && unreadCount > 0 && (
            <span className="ann-unread-badge">{unreadCount}</span>
          )}
        </Link>
        {user?.role === 'ADMIN' && (
          <Link to="/admin" className="navbar__link">
            Admin console
          </Link>
        )}
      </nav>
      {user && (
        <div className="navbar__user">
          <span className="navbar__identity">
            {user.fullName} <span className="navbar__role">{user.role}</span>
          </span>
          <button type="button" className="navbar__logout" onClick={logout}>
            Log out
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
