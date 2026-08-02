interface AuthErrorMessageProps {
  message: string | null;
}

/**
 * Inline error banner shared by the auth pages. Renders nothing when there
 * is no message.
 */
const AuthErrorMessage = ({ message }: AuthErrorMessageProps) => {
  if (!message) {
    return null;
  }

  return (
    <div className="alert alert--danger" role="alert">
      {message}
    </div>
  );
};

export default AuthErrorMessage;
