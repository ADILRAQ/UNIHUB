/** Cross-cutting API types shared across features. */

/**
 * Backend error body shape (matches `GlobalExceptionHandler`'s `ErrorResponse`).
 * `errorCode` lets the client branch without parsing human-readable text. This
 * is the canonical, app-wide error shape — feature code re-imports it from here.
 */
export interface ApiErrorBody {
  message: string;
  status: number;
  path: string;
  timestamp: string;
  errorCode?: string;
}
