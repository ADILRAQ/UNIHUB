import axios from 'axios';

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

// Epic 2 (auth) hooks in here: a request interceptor will read the JWT access
// token from storage and attach it as `Authorization: Bearer <token>` on every
// outgoing request, and a response interceptor will redirect to /login on 401
// and force the change-password screen when `mustChangePassword` is set.
// No auth logic yet — UNIH-12 is scaffolding only.

export default apiClient;
