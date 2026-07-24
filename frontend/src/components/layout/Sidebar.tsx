import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

/**
 * Role-aware main navigation sidebar. Links are shown based on the
 * authenticated user's role:
 * - ALL roles: Home, Schedule, Announcements
 * - TEACHER + ADMIN: Timetable, Teacher workspace
 * - ADMIN only: Admin console
 */
const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'sidebar-link sidebar-link--active' : 'sidebar-link';

  return (
    <nav className="sidebar" aria-label="Main navigation">
      <ul>
        <li>
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/schedule" className={linkClass}>
            Schedule
          </NavLink>
        </li>
        <li>
          <NavLink to="/announcements" className={linkClass}>
            Announcements
          </NavLink>
        </li>
        {(role === 'TEACHER' || role === 'ADMIN') && (
          <>
            <li>
              <NavLink to="/timetable" className={linkClass}>
                Timetable
              </NavLink>
            </li>
            <li>
              <NavLink to="/teacher" className={linkClass}>
                Teacher workspace
              </NavLink>
            </li>
          </>
        )}
        {role === 'ADMIN' && (
          <li>
            <NavLink to="/admin" className={linkClass}>
              Admin console
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Sidebar;
