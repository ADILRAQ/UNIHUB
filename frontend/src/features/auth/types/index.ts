/** Auth-feature-local types. Cross-cutting shapes stay in `api/types.ts`. */

export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

/** Request body for `POST /api/auth/login`. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Request body for `POST /api/auth/change-password`. */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Success response for both `POST /api/auth/login` and
 * `POST /api/auth/change-password` (the latter returns a fresh token whose
 * `mustChangePassword` is cleared).
 */
export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  role: Role;
  mustChangePassword: boolean;
}

/**
 * The reactive, in-memory representation of the signed-in user. Mostly a
 * projection of the JWT claims, plus `fullName` which the token does not carry
 * (it comes from the login/change-password response and is cached separately).
 */
export interface AuthUser {
  userId: number;
  email: string;
  fullName: string;
  role: Role;
  mustChangePassword: boolean;
}

/**
 * Decoded JWT payload (the middle base64url segment). Signed server-side with
 * HS256; the client only reads the claims to rehydrate state / check expiry and
 * never verifies the signature. `sub` is the userId as a string; `exp`/`iat`
 * are epoch seconds. Note there is intentionally no `fullName` claim.
 */
export interface JwtClaims {
  sub: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
  exp: number;
  /** Optional: present in tokens but not validated by `decodeToken`, so not guaranteed. */
  iat?: number;
}
