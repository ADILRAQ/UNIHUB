import axios from 'axios';
import { clearToken, getToken } from '../features/auth/tokenStorage';

/**
 * Single typed HTTP client for the whole app. Every feature-level API module
 * (e.g. `features/health/api.ts`) must go through this instance instead of
 * calling axios/fetch directly.
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
 * - 401 (missing/invalid/expired token): clear the token and send the user to
 *   `/login`. Guarded so the login request's own 401 does not loop — the login
 *   page surfaces that error itself.
 * - 403 with `errorCode === 'MUST_CHANGE_PASSWORD'`: the backend gates a flagged
 *   user out of every other endpoint; route them to the change-password screen.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl: string = error.config?.url ?? '';
    const path = window.location.pathname;

    const isLoginRequest = requestUrl.includes('/api/auth/login');

    if (status === 401 && !isLoginRequest && path !== '/login') {
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
