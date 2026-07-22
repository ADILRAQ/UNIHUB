import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import usePostData from '../../../hooks/usePostData';
import { useAuth } from '../AuthContext';
import { changePassword as changePasswordRequest } from '../services/authService';
import { homePathForRole } from '../roleHome';
import type { AuthResponse, ChangePasswordRequest } from '../types';
import type { ApiErrorBody } from '../../../api/types';

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

export interface UseChangePasswordPage {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  fieldError: string | null;
  serverError: string | null;
  isPending: boolean;
  showTempPasswordHint: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

/**
 * All logic for the change-password page: form state, client-side validation,
 * the change-password mutation via `usePostData`, applying the fresh token, and
 * navigating to the role home on success. The page renders purely from this.
 */
const useChangePasswordPage = (): UseChangePasswordPage => {
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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
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

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    fieldError,
    serverError,
    isPending,
    showTempPasswordHint: user?.mustChangePassword ?? false,
    onCurrentPasswordChange: setCurrentPassword,
    onNewPasswordChange: setNewPassword,
    onConfirmPasswordChange: setConfirmPassword,
    onSubmit,
  };
};

export default useChangePasswordPage;
