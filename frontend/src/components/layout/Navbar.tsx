import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import useGetData from '../../hooks/useGetData';
import { getUnreadCount } from '../../features/announcements/services/announcementService';

/**
 * Top bar for the authenticated area. Shows the signed-in user's name and
 * role, nav links for all roles (Announcements, Courses, Calendar, Payments),
 * role-scoped links (Timetable for TEACHER/ADMIN, Admin console for ADMIN),
 * and a logout button.
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { data: unreadCount } = useGetData<{ count: number }, string, number>({
    queryKey: ['announcements', 'unread-count'],
    queryFn: getUnreadCount,
    transformFn: (d) => d.count,
    enabled: !!user,
  });

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'navbar__link navbar__link--active' : 'navbar__link';

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <NavLink to="/" className="navbar__brand" aria-label="UniHub home">
        <span className="navbar__logo" aria-hidden="true">UH</span>
        <span className="navbar__wordmark">UniHub</span>
      </NavLink>

      <nav className="navbar__nav" aria-label="Main navigation">
        <NavLink
          to="/announcements"
          className={({ isActive }) =>
            isActive
              ? 'navbar__link navbar__link--active navbar__link--with-badge'
              : 'navbar__link navbar__link--with-badge'
          }
        >
          Announcements
          {!!unreadCount && unreadCount > 0 && (
            <span className="ann-unread-badge" aria-label={`${unreadCount} unread`}>
              {unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink to="/courses" className={linkClass}>
          Courses
        </NavLink>

        <NavLink to="/schedule" className={linkClass}>
          Calendar
        </NavLink>

        <NavLink to="/payments" className={linkClass}>
          Payments
        </NavLink>

        {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
          <NavLink to="/timetable" className={linkClass}>
            Timetable
          </NavLink>
        )}

        {user?.role === 'ADMIN' && (
          <NavLink to="/admin" className={linkClass}>
            Admin
          </NavLink>
        )}
      </nav>

      {user && (
        <div className="navbar__user">
          <span className="navbar__name">{user.fullName}</span>
          <span className="badge badge--neutral">{user.role}</span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
            Log out
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
