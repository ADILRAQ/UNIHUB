import useGetData from '../../../hooks/useGetData';
import { getHealth } from '../services/healthService';
import type { HealthResponse } from '../types';

export interface UseHealthStatus {
  isLoading: boolean;
  isError: boolean;
  data: HealthResponse | undefined;
  /** Backend base URL, surfaced for the error state's guidance message. */
  apiUrl: string;
}

/**
 * Logic for the health widget: fetches `/api/health` through the generic
 * `useGetData` and exposes the loading / error / success signals the component
 * renders from. Keeps the data fetching out of the presentational component.
 */
const useHealthStatus = (): UseHealthStatus => {
  const { data, isLoading, isError } = useGetData<HealthResponse, string, HealthResponse>({
    queryKey: ['health'],
    queryFn: getHealth,
    transformFn: (health) => health,
  });

  return {
    isLoading,
    isError,
    data,
    apiUrl: import.meta.env.VITE_API_URL,
  };
};

export default useHealthStatus;
