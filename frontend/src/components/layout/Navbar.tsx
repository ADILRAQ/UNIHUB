import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

/**
 * Top bar for the authenticated area (rendered inside `RequireAuth` via
 * `BaseLayout`, so a user is always present). Shows the signed-in user's name
 * and role, role-scoped nav links (the admin console for ADMINs), and a logout
 * button that clears the session.
 */
const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="navbar__title">
        UniHub
      </Link>
      <nav className="navbar__nav" aria-label="Main navigation">
        <Link to="/schedule" className="navbar__link">
          Calendar
        </Link>
        {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
          <Link to="/timetable" className="navbar__link">
            Timetable
          </Link>
        )}
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
