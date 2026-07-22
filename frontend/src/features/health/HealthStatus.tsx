import useGetData from '../../hooks/useGetData';
import { getHealth } from './api';
import type { HealthResponse } from '../../api/types';

/**
 * Displays live API health on the home page. Every async view in the app
 * must render loading / empty / error states — never a blank screen while
 * data is in flight or unavailable (CLAUDE.md "Hard rules").
 */
const HealthStatus = () => {
  const { data, isLoading, isError } = useGetData<HealthResponse, string, HealthResponse>({
    queryKey: ['health'],
    queryFn: getHealth,
    transformFn: (health) => health,
  });

  if (isLoading) {
    return (
      <div className="health-status health-status--loading" role="status">
        Checking API status...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="health-status health-status--error" role="alert">
        <strong>API unreachable.</strong> Could not reach the backend at{' '}
        <code>{import.meta.env.VITE_API_URL}</code>. Start the backend with{' '}
        <code>docker compose up</code> and reload.
      </div>
    );
  }

  return (
    <div className="health-status health-status--ok">
      <strong>API status:</strong> {data.status} (v{data.version})
    </div>
  );
};

export default HealthStatus;
