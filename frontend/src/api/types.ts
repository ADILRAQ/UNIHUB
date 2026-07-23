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

/**
 * Generic Spring `Page` projection used by list endpoints.
 * Mirrors the backend `PagedResponse<T>` record field-for-field.
 *
 * - `page`          — zero-based current page index (backend field name)
 * - `size`          — requested page size
 * - `totalElements` — total matching rows across all pages
 * - `totalPages`    — total number of pages
 */
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
