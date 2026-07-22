import type { JwtClaims } from './types';

/**
 * Decodes a JWT payload client-side (base64url of the middle segment) without
 * verifying the signature — the server owns validation; the client only reads
 * the claims to rehydrate auth state and check expiry. No network call.
 *
 * Returns `null` for any malformed token so callers can treat a bad/tampered
 * token exactly like "not logged in".
 */
export const decodeToken = (token: string): JwtClaims | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // base64url -> base64, then re-pad to a multiple of 4.
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padding);

    // atob yields a Latin1 byte string; decode as UTF-8 so non-ASCII names survive.
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );

    const claims = JSON.parse(json) as Partial<JwtClaims>;

    if (
      typeof claims.sub !== 'string' ||
      typeof claims.email !== 'string' ||
      typeof claims.role !== 'string' ||
      typeof claims.exp !== 'number'
    ) {
      return null;
    }

    return claims as JwtClaims;
  } catch {
    return null;
  }
};

/** True when the token's expiry (epoch seconds) is at or before now. */
export const isExpired = (claims: JwtClaims): boolean => claims.exp * 1000 <= Date.now();
