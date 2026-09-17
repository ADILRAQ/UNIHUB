import { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import useGetData from '../../hooks/useGetData';
import { getUnreadCount } from '../../features/announcements/services/announcementService';

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const toggleMenu = useCallback(() => setMenuOpen(o => !o), []);

  const { data: unreadCount } = useGetData<{ count: number }, string, number>({
    queryKey: ['announcements', 'unread-count'],
    queryFn: getUnreadCount,
    transformFn: (d) => d.count,
    enabled: !!user,
  });

  const role = user?.role ?? '';

  // Mobile menu links only — desktop nav is in the sidebar
  const mobileLinks = (
    <>
      <NavLink to="/" end className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>Home</NavLink>
      <NavLink to="/announcements" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active navbar__link--with-badge' : 'navbar__link navbar__link--with-badge'}>
        Announcements
        {!!unreadCount && unreadCount > 0 && (
          <span className="ann-unread-badge" aria-label={`${unreadCount} unread`}>{unreadCount}</span>
        )}
      </NavLink>
      <NavLink to="/courses"  className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>Courses</NavLink>
      <NavLink to="/schedule" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>Calendar</NavLink>
      <NavLink to="/payments" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>Payments</NavLink>
      {(role === 'TEACHER' || role === 'ADMIN') && (
        <NavLink to="/timetable" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>Timetable</NavLink>
      )}
      {(role === 'TEACHER' || role === 'ADMIN') && (
        <NavLink to="/teacher" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>Workspace</NavLink>
      )}
      {role === 'ADMIN' && (
        <NavLink to="/admin" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>Admin</NavLink>
      )}
    </>
  );

  return (
    <>
      <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <NavLink to="/" className="navbar__brand" aria-label="UniHub home">
          <span className="navbar__logo" aria-hidden="true">UH</span>
          <span className="navbar__wordmark">UniHub</span>
        </NavLink>

        {/* Date — hidden on mobile */}
        <span className="navbar__date">{TODAY}</span>

        {user && (
          <div className="navbar__user">
            <span className="navbar__name">{user.fullName}</span>
            <span className="badge badge--neutral">{user.role}</span>
            <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
              Log out
            </button>
          </div>
        )}

        <button
          type="button"
          className={`navbar__burger${menuOpen ? ' navbar__burger--open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <span /><span /><span />
        </button>
      </header>

      {menuOpen && (
        <div className="navbar__mobile-menu" role="navigation" aria-label="Mobile navigation">
          {mobileLinks}
          {user && (
            <div className="navbar__mobile-footer">
              <span className="navbar__name">{user.fullName}</span>
              <span className="badge badge--neutral">{user.role}</span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
                Log out
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
