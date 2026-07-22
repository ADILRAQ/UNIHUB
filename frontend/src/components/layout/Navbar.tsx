import { useAuth } from '../../features/auth/AuthContext';

/**
 * Top bar for the authenticated area (rendered inside `RequireAuth` via
 * `BaseLayout`, so a user is always present). Shows the signed-in user's name
 * and role and a logout button that clears the session.
 */
const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <span className="navbar__title">UniHub</span>
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
