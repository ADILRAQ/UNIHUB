import { isAxiosError } from 'axios';
import type { ApiErrorBody } from '../api/types';

/**
 * Shared helper: turns an unknown thrown value (typically an Axios error) into a
 * user-facing message, preferring the backend's `ErrorResponse.message`. Lives
 * in shared `utils/` so every feature surfaces server errors consistently.
 *
 * @param fallback message used when the error is not a recognizable API error
 *   (e.g. a network failure with no response body).
 */
export const apiErrorMessage = (error: unknown, fallback = 'Something went wrong.'): string => {
  if (isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
};

/** Convenience: the HTTP status of an Axios error, or `undefined`. */
export const apiErrorStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined;
