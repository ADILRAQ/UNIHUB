/** Health-feature-local types. */

/** Response shape for `GET /api/health`. */
export interface HealthResponse {
  status: string;
  version: string;
}
