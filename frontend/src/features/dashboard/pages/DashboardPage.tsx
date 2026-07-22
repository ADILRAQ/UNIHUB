import { Link } from 'react-router-dom';
import useDashboardPage from '../hooks/useDashboardPage';
import HealthStatus from '../../health/components/HealthStatus';

/**
 * Authenticated landing page. Greets the signed-in user by name + role and
 * keeps the API health check demonstrable. Real per-role feature sections
 * arrive in later epics; the admin-only link below proves `RequireRole` works.
 * All logic lives in `useDashboardPage` — this component only renders.
 */
const DashboardPage = () => {
  const { user, isAdmin } = useDashboardPage();

  return (
    <section>
      <h1>Welcome to UniHub</h1>
      {user && (
        <p>
          Signed in as <strong>{user.fullName}</strong> ({user.role}).
        </p>
      )}
      <p>Announcements, schedule, resources, recaps, and payments in one place.</p>

      {isAdmin && (
        <p>
          <Link to="/admin">Go to the admin area</Link>
        </p>
      )}

      <HealthStatus />
    </section>
  );
};

export default DashboardPage;
