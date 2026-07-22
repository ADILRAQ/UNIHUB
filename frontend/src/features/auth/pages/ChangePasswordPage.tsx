import useChangePasswordPage from '../hooks/useChangePasswordPage';
import AuthField from '../components/AuthField';
import AuthErrorMessage from '../components/AuthErrorMessage';

/** Thin UI for the change-password screen — all logic lives in `useChangePasswordPage`. */
const ChangePasswordPage = () => {
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    fieldError,
    serverError,
    isPending,
    showTempPasswordHint,
    onCurrentPasswordChange,
    onNewPasswordChange,
    onConfirmPasswordChange,
    onSubmit,
  } = useChangePasswordPage();

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h1 className="auth-card__title">Change your password</h1>
        {showTempPasswordHint && (
          <p className="auth-hint">
            You are using a temporary password. Set a new password to continue.
          </p>
        )}

        <AuthField
          label="Current password"
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          value={currentPassword}
          onChange={onCurrentPasswordChange}
          disabled={isPending}
          required
        />

        <AuthField
          label="New password"
          type="password"
          name="newPassword"
          autoComplete="new-password"
          value={newPassword}
          onChange={onNewPasswordChange}
          disabled={isPending}
          required
        />

        <AuthField
          label="Confirm new password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          disabled={isPending}
          required
        />

        <AuthErrorMessage message={fieldError} />
        <AuthErrorMessage message={serverError} />

        <button type="submit" className="auth-button" disabled={isPending}>
          {isPending ? 'Saving...' : 'Change password'}
        </button>
      </form>
    </main>
  );
};

export default ChangePasswordPage;
