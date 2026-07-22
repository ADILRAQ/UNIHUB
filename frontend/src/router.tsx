import { createBrowserRouter, Outlet } from 'react-router-dom';
import BaseLayout from './components/layout/BaseLayout';
import { AuthProvider } from './features/auth/AuthContext';
import RequireAuth from './features/auth/RequireAuth';
import RequireRole from './features/auth/RequireRole';
import LoginPage from './features/auth/LoginPage';
import ChangePasswordPage from './features/auth/ChangePasswordPage';
import DashboardPage from './features/dashboard/DashboardPage';
import AdminPage from './features/admin/AdminPage';

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
