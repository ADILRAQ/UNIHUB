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
    <main className="flex-center" style={{ minHeight: '100vh', background: 'var(--surface-bg)', padding: 'var(--space-8)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <h1 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', letterSpacing: '-0.02em' }}>
          Change your password
        </h1>

        {showTempPasswordHint && (
          <div className="alert alert--warning" style={{ marginBottom: 'var(--space-4)' }}>
            You are using a temporary password. Set a new password to continue.
          </div>
        )}

        <form
          onSubmit={onSubmit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}
        >
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

          <button type="submit" className="btn btn--primary w-full" disabled={isPending}>
            {isPending ? 'Saving…' : 'Change password'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ChangePasswordPage;
