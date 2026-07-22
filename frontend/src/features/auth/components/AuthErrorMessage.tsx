interface AuthErrorMessageProps {
  message: string | null;
}

/**
 * Inline error banner shared by the auth pages. Both the field-validation and
 * server-error messages on login + change-password rendered the identical
 * `auth-error` alert paragraph; this factors out that duplicated markup. Renders
 * nothing when there is no message (matches the previous `{error && ...}` guard).
 */
const AuthErrorMessage = ({ message }: AuthErrorMessageProps) => {
  if (!message) {
    return null;
  }

  return (
    <p className="auth-error" role="alert">
      {message}
    </p>
  );
};

export default AuthErrorMessage;
