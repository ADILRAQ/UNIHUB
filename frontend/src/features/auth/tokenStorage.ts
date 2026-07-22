/**
 * Single source of truth for the persisted JWT access token.
 *
 * Per the Epic 2 decision, the token lives in `localStorage` (this app uses a
 * single access token with a hard 12-24h ceiling and no refresh token, so the
 * "refresh token in httpOnly cookie" split does not apply). Every read/write of
 * the token goes through this module so the storage key is defined in one place.
 */

const TOKEN_KEY = 'unihub_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};
