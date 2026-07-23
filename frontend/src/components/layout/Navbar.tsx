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
      {user?.role === 'ADMIN' && (
        <nav className="navbar__nav" aria-label="Admin navigation">
          <Link to="/admin" className="navbar__link">
            Admin console
          </Link>
        </nav>
      )}
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
