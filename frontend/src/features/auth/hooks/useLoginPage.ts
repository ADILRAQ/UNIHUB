import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import usePostData from '../../../hooks/usePostData';
import { useAuth } from '../AuthContext';
import { login as loginRequest } from '../services/authService';
import { homePathForRole } from '../roleHome';
import type { AuthResponse, LoginRequest } from '../types';
import type { ApiErrorBody } from '../../../api/types';

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

export interface UseLoginPage {
  email: string;
  password: string;
  fieldError: string | null;
  serverError: string | null;
  isPending: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

/**
 * All logic for the login page: form state, client-side validation, the login
 * mutation via the generic `usePostData`, error mapping, and success navigation
 * (forced change-password when flagged, otherwise the role home). The page
 * component renders purely from what this returns.
 */
const useLoginPage = (): UseLoginPage => {
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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
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

  return {
    email,
    password,
    fieldError,
    serverError,
    isPending,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onSubmit,
  };
};

export default useLoginPage;
