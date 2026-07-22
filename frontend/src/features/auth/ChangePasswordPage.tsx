import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import usePostData from '../../hooks/usePostData';
import { useAuth } from './AuthContext';
import { changePassword as changePasswordRequest } from './api';
import { homePathForRole } from './roleHome';
import type { ApiErrorBody, AuthResponse, ChangePasswordRequest } from './types';

const MIN_LENGTH = 8;

/** Maps a change-password error into a user-facing message. */
const messageForError = (error: unknown): string => {
  if (isAxiosError<ApiErrorBody>(error) && error.response) {
    if (error.response.status === 401) {
      return 'Your current password is incorrect.';
    }
    return error.response.data?.message ?? 'Could not change your password. Please try again.';
  }
  return 'Could not reach the server. Check your connection and try again.';
};

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { user, applyNewToken } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate, isPending } = usePostData<string, ChangePasswordRequest, AuthResponse>({
    keys: ['auth', 'change-password'],
    serviceFn: changePasswordRequest,
    onSuccessFn: (response) => {
      applyNewToken(response);
      navigate(homePathForRole(response.role), { replace: true });
    },
    onErrorFn: (error) => setServerError(messageForError(error)),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFieldError('All fields are required.');
      return;
    }
    if (newPassword.length < MIN_LENGTH) {
      setFieldError(`New password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (newPassword === currentPassword) {
      setFieldError('New password must be different from your current password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldError('New password and confirmation do not match.');
      return;
    }

    setFieldError(null);
    mutate({ currentPassword, newPassword });
  };

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1 className="auth-card__title">Change your password</h1>
        {user?.mustChangePassword && (
          <p className="auth-hint">
            You are using a temporary password. Set a new password to continue.
          </p>
        )}

        <label className="auth-field">
          <span>Current password</span>
          <input
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            disabled={isPending}
            required
          />
        </label>

        <label className="auth-field">
          <span>New password</span>
          <input
            type="password"
            name="newPassword"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            disabled={isPending}
            required
          />
        </label>

        <label className="auth-field">
          <span>Confirm new password</span>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
          {isPending ? 'Saving...' : 'Change password'}
        </button>
      </form>
    </main>
  );
};

export default ChangePasswordPage;
