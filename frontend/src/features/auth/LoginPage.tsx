import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import usePostData from '../../hooks/usePostData';
import { useAuth } from './AuthContext';
import { login as loginRequest } from './api';
import { homePathForRole } from './roleHome';
import type { ApiErrorBody, AuthResponse, LoginRequest } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Maps a login error into a user-facing message, keyed off `errorCode`. */
const messageForError = (error: unknown): string => {
  if (isAxiosError<ApiErrorBody>(error) && error.response) {
    const code = error.response.data?.errorCode;
    switch (code) {
      case 'INVALID_CREDENTIALS':
        // Generic on purpose — never reveal which field was wrong.
        return 'Invalid email or password.';
      case 'ACCOUNT_DEACTIVATED':
        return 'This account has been deactivated. Contact an administrator.';
      case 'TEMP_PASSWORD_EXPIRED':
        return 'Your temporary password has expired. Contact an administrator for a new one.';
      default:
        return error.response.data?.message ?? 'Login failed. Please try again.';
    }
  }
  return 'Could not reach the server. Check your connection and try again.';
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate, isPending } = usePostData<string, LoginRequest, AuthResponse>({
    keys: ['auth', 'login'],
    serviceFn: loginRequest,
    onSuccessFn: (response) => {
      login(response);
      navigate(
        response.mustChangePassword ? '/change-password' : homePathForRole(response.role),
        { replace: true },
      );
    },
    onErrorFn: (error) => setServerError(messageForError(error)),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setFieldError('Email and password are required.');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setFieldError('Enter a valid email address.');
      return;
    }

    setFieldError(null);
    mutate({ email: trimmedEmail, password });
  };

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1 className="auth-card__title">Sign in to UniHub</h1>

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isPending}
            required
          />
        </label>

        {fieldError && (
          <p className="auth-error" role="alert">
            {fieldError}
          </p>
        )}
        {serverError && (
          <p className="auth-error" role="alert">
            {serverError}
          </p>
        )}

        <button type="submit" className="auth-button" disabled={isPending}>
          {isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
};

export default LoginPage;
