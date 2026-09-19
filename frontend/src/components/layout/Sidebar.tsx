import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import useGetData from '../../hooks/useGetData';
import { getUnreadCount } from '../../features/announcements/services/announcementService';

// ── Icons (exact artboard SVG paths) ─────────────────────────────────────────

const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/>
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/>
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/>
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>
  </svg>
);

const IconAnnouncements = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 10.2v3.6a1.2 1.2 0 0 0 1.2 1.2h2.1L13 19V5l-6.2 4H4.7a1.2 1.2 0 0 0-1.2 1.2Z"/>
    <path d="M17.5 8.6a4.6 4.6 0 0 1 0 6.8"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2.5"/>
    <path d="M3 10h18M8 3v4M16 3v4"/>
  </svg>
);

const IconCourses = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>
  </svg>
);

const IconPayments = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="5" width="19" height="14" rx="2.5"/>
    <path d="M2.5 10h19"/>
  </svg>
);

const IconTimetable = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/>
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>
    <path d="M7.5 13.5h3M13.5 13.5h3M7.5 17.5h3"/>
  </svg>
);

const IconTeacher = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 19.5V18a4 4 0 0 0-4-4H6.5a4 4 0 0 0-4 4v1.5"/>
    <circle cx="9.2" cy="7.2" r="3.6"/>
    <path d="M17.5 13.6a4 4 0 0 1 3 3.9v2"/>
    <path d="M15.8 3.8a3.6 3.6 0 0 1 0 6.8"/>
  </svg>
);

const IconAdmin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.6 20 5.6v5.9c0 4.9-3.3 8.5-8 9.9-4.7-1.4-8-5-8-9.9V5.6l8-3Z"/>
  </svg>
);

const IconLogout = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 21h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <path d="m16.5 16.5 5-4.5-5-4.5"/>
    <path d="M21.5 12H9.5"/>
  </svg>
);

// ── Nav items ─────────────────────────────────────────────────────────────────

type NavItem = {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  roles?: string[];
  badge?: number;
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role ?? '';

  const { data: unreadCount } = useGetData<{ count: number }, string, number>({
    queryKey: ['announcements', 'unread-count'],
    queryFn: getUnreadCount,
    transformFn: (d) => d.count,
    enabled: !!user,
  });

  const navItems: NavItem[] = [
    { to: '/', end: true,       label: 'Dashboard',     icon: <IconDashboard /> },
    { to: '/announcements',     label: 'Announcements', icon: <IconAnnouncements />, badge: unreadCount },
    { to: '/schedule',          label: 'Calendar',      icon: <IconCalendar /> },
    { to: '/courses',           label: 'Courses',       icon: <IconCourses /> },
    { to: '/payments',          label: 'Payments',      icon: <IconPayments /> },
    { to: '/timetable', roles: ['TEACHER','ADMIN'], label: 'Timetable', icon: <IconTimetable /> },
    { to: '/teacher',   roles: ['TEACHER','ADMIN'], label: 'Teacher',   icon: <IconTeacher /> },
    { to: '/admin',     roles: ['ADMIN'],           label: 'Admin',     icon: <IconAdmin /> },
  ];

  const visible = navItems.filter(i => !i.roles || i.roles.includes(role));

  return (
    <aside className="app-sidebar" aria-label="Main navigation">
      {/* Logo */}
      <div className="sidebar-brand">
        <div className="sidebar-brand__icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8.2 12 4l9 4.2-9 4.2-9-4.2Z"/>
            <path d="M7.2 10.6V15c0 1.5 2.2 2.6 4.8 2.6s4.8-1.1 4.8-2.6v-4.4"/>
          </svg>
        </div>
        <span className="sidebar-brand__name">UniHub</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <ul className="sidebar-nav">
          {visible.map(({ to, end, label, icon, badge }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
                }
              >
                <span className="sidebar-link__icon">{icon}</span>
                <span className="sidebar-link__label">{label}</span>
                {!!badge && badge > 0 && (
                  <span className="sidebar-link__badge" aria-label={`${badge} unread`}>
                    {badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User */}
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user__avatar">
            {getInitials(user.fullName)}
          </div>
          <div className="sidebar-user__info">
            <p className="sidebar-user__name">{user.fullName}</p>
            <p className="sidebar-user__role">
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </p>
          </div>
          <button
            className="sidebar-user__logout"
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
          >
            <IconLogout />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
