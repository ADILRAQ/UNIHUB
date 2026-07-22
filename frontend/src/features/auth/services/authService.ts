import apiClient from '../../../api/client';
import type { AuthResponse, ChangePasswordRequest, LoginRequest } from '../types';

/**
 * Thin service functions for the auth endpoints, following the same pattern as
 * `features/health/services/healthService.ts`. These are passed as the
 * `serviceFn` to `usePostData` in the page logic hooks — no ad-hoc fetching.
 */

export const login = (body: LoginRequest): Promise<AuthResponse> =>
  apiClient.post<AuthResponse>('/api/auth/login', body).then((response) => response.data);

export const changePassword = (body: ChangePasswordRequest): Promise<AuthResponse> =>
  apiClient
    .post<AuthResponse>('/api/auth/change-password', body)
    .then((response) => response.data);
