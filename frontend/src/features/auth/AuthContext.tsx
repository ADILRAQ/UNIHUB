import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearToken, getToken, setToken } from './tokenStorage';
import { decodeToken, isExpired } from '../../utils/jwt';
import type { AuthResponse, AuthUser } from './types';

/**
 * The token carries every auth claim except `fullName`, so we cache the display
 * name separately to keep the navbar greeting correct across a cold reload.
 */
const FULL_NAME_KEY = 'unihub_full_name';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Persists the token + hydrates `user` after a successful login. */
  login: (response: AuthResponse) => void;
  /** Swaps to a fresh token (e.g. after a password change) + updates `user`. */
  applyNewToken: (response: AuthResponse) => void;
  /** Clears the session and redirects to `/login`. */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Builds an `AuthUser` from an API response and persists both token + name. */
const persistSession = (response: AuthResponse): AuthUser => {
  setToken(response.token);
  localStorage.setItem(FULL_NAME_KEY, response.fullName);
  return {
    userId: response.userId,
    email: response.email,
    fullName: response.fullName,
    role: response.role,
    mustChangePassword: response.mustChangePassword,
  };
};

/**
 * Rehydrates the user from a persisted token on cold start. Returns `null` if
 * there is no token, or it is malformed or expired (treated as "logged out").
 * `fullName` is not a JWT claim, so it falls back to the cached name, then email.
 */
const hydrateFromStorage = (): AuthUser | null => {
  const token = getToken();
  if (!token) {
    return null;
  }

  const claims = decodeToken(token);
  if (!claims || isExpired(claims)) {
    clearToken();
    localStorage.removeItem(FULL_NAME_KEY);
    return null;
  }

  return {
    userId: Number(claims.sub),
    email: claims.email,
    fullName: localStorage.getItem(FULL_NAME_KEY) ?? claims.email,
    role: claims.role,
    mustChangePassword: claims.mustChangePassword,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(hydrateFromStorage);

  const login = useCallback((response: AuthResponse) => {
    setUser(persistSession(response));
  }, []);

  const applyNewToken = useCallback((response: AuthResponse) => {
    setUser(persistSession(response));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(FULL_NAME_KEY);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, applyNewToken, logout }),
    [user, login, applyNewToken, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Access the auth state/actions. Throws if used outside an `AuthProvider`. */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
