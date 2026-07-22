import apiClient from '../../../api/client';
import type { HealthResponse } from '../types';

export const getHealth = (): Promise<HealthResponse> =>
  apiClient.get<HealthResponse>('/api/health').then((response) => response.data);
