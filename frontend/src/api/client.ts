import axios from 'axios';
import { clearToken, getToken } from '../features/auth/tokenStorage';

/**
 * Single typed HTTP client for the whole app. Every feature service module
 * (e.g. `features/health/services/healthService.ts`) must go through this
 * instance instead of calling axios/fetch directly.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: attach the JWT (if any) as a Bearer token on every
 * outgoing request. Reads from the single `tokenStorage` source of truth.
 */
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor: react to auth failures at the transport layer. These
 * redirects use `window.location` because interceptors run outside React
 * Router's context (no `useNavigate`); a hard navigation also resets in-memory
 * app + query state, which is the desired outcome on a forced logout.
 *
 * - 401 caused by an actual token problem (missing/invalid/expired — the backend
 *   sends `errorCode: 'UNAUTHENTICATED'`): clear the token and send the user to
 *   `/login`.
 * - 401 caused by WRONG CREDENTIALS on an auth endpoint (`errorCode:
 *   'INVALID_CREDENTIALS'` — a bad password at login, or a mistyped current
 *   password at change-password): NOT a session problem. The page surfaces the
 *   error inline and the session is kept. Auto-logging out here would kick a user
 *   back to login on every change-password typo.
 * - 403 with `errorCode === 'MUST_CHANGE_PASSWORD'`: the backend gates a flagged
 *   user out of every other endpoint; route them to the change-password screen.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorCode: string | undefined = error.response?.data?.errorCode;
    const path = window.location.pathname;

    // Wrong-credentials 401s (login or change-password) are surfaced inline by the
    // page and must never trigger a forced logout — only real token problems do.
    const isBadCredentials = errorCode === 'INVALID_CREDENTIALS';

    if (status === 401 && !isBadCredentials && path !== '/login') {
      clearToken();
      window.location.href = '/login';
    } else if (
      status === 403 &&
      error.response?.data?.errorCode === 'MUST_CHANGE_PASSWORD' &&
      path !== '/change-password'
    ) {
      window.location.href = '/change-password';
    }

    return Promise.reject(error);
  },
);

export default apiClient;
