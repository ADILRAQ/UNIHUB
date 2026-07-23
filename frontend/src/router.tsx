import { createBrowserRouter, Outlet } from 'react-router-dom';
import BaseLayout from './components/layout/BaseLayout';
import { AuthProvider } from './features/auth/AuthContext';
import RequireAuth from './features/auth/components/RequireAuth';
import RequireRole from './features/auth/components/RequireRole';
import LoginPage from './features/auth/pages/LoginPage';
import ChangePasswordPage from './features/auth/pages/ChangePasswordPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import AdminPage from './features/admin/pages/AdminPage';
import AnnouncementsPage from './features/announcements/pages/AnnouncementsPage';
import AnnouncementDetailPage from './features/announcements/pages/AnnouncementDetailPage';
import ComposerPage from './features/announcements/pages/ComposerPage';

/**
 * Route tree.
 *
 * `AuthProvider` is the top-level element so it sits inside the RouterProvider
 * (it needs `useNavigate` for logout) while every page below it can call
 * `useAuth`. `/login` and `/change-password` render standalone (no BaseLayout
 * chrome). Everything else is nested under `RequireAuth` -> `BaseLayout`, with
 * role-restricted subtrees additionally wrapped in `RequireRole`.
 */
const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/change-password', element: <ChangePasswordPage /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <BaseLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'announcements', element: <AnnouncementsPage /> },
              { path: 'announcements/:id', element: <AnnouncementDetailPage /> },
              {
                element: <RequireRole allowed={['TEACHER', 'ADMIN']} />,
                children: [
                  { path: 'announcements/new', element: <ComposerPage /> },
                  { path: 'announcements/:id/edit', element: <ComposerPage /> },
                ],
              },
              {
                element: <RequireRole allowed={['ADMIN']} />,
                children: [{ path: 'admin', element: <AdminPage /> }],
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
