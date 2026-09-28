import { Link } from 'react-router-dom';
import useChangePasswordPage from '../hooks/useChangePasswordPage';

/** Artboard: centered card, no sidebar, two radial blobs, password strength hints. */
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

  const hasMinLength = newPassword.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: 24 }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -220, right: -180, width: 560, height: 560, borderRadius: 'var(--radius-full)', background: 'radial-gradient(circle, rgba(255, 107, 31, 0.14) 0%, rgba(255, 107, 31, 0) 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -200, left: -160, width: 480, height: 480, borderRadius: 'var(--radius-full)', background: 'radial-gradient(circle, rgba(255, 107, 31, 0.10) 0%, rgba(255, 107, 31, 0) 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 22, position: 'relative' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--orange-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8.2 12 4l9 4.2-9 4.2-9-4.2Z"/><path d="M7.2 10.6V15c0 1.5 2.2 2.6 4.8 2.6s4.8-1.1 4.8-2.6v-4.4"/>
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>UniHub</span>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(24px, 5vw, 40px)', boxShadow: 'var(--shadow-float)', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--orange-100)', color: 'var(--orange-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>
              </svg>
            </span>
            <h1 style={{ margin: 0, fontSize: 24, lineHeight: '32px', fontWeight: 600, color: 'var(--ink-900)', letterSpacing: '-0.01em' }}>Set a new password</h1>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--ink-500)' }}>
              {showTempPasswordHint
                ? "You're signing in with a temporary password. Choose a new one before continuing — this is required for every new account."
                : 'Choose a new password for your account.'}
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label htmlFor="curPass" className="label" style={{ margin: 0 }}>
                Current {showTempPasswordHint ? '(temporary) ' : ''}password
              </label>
              <input
                id="curPass"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => onCurrentPasswordChange(e.target.value)}
                disabled={isPending}
                required
                className="input"
                style={{ height: 48, fontSize: 16 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label htmlFor="newPass" className="label" style={{ margin: 0 }}>New password</label>
              <input
                id="newPass"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                disabled={isPending}
                required
                className="input"
                style={{ height: 48, fontSize: 16 }}
              />
              {newPassword.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {hasMinLength ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success-700)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6.5 9 17.5l-5-5"/></svg>
                    ) : (
                      <span style={{ width: 14, height: 14, borderRadius: 'var(--radius-full)', border: '1.6px solid var(--border-strong)', flexShrink: 0, display: 'inline-block' }} />
                    )}
                    <span style={{ fontSize: 12, color: hasMinLength ? 'var(--ink-700)' : 'var(--ink-500)' }}>At least 8 characters</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {hasNumberOrSymbol ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success-700)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6.5 9 17.5l-5-5"/></svg>
                    ) : (
                      <span style={{ width: 14, height: 14, borderRadius: 'var(--radius-full)', border: '1.6px solid var(--border-strong)', flexShrink: 0, display: 'inline-block' }} />
                    )}
                    <span style={{ fontSize: 12, color: hasNumberOrSymbol ? 'var(--ink-700)' : 'var(--ink-500)' }}>One number or symbol</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label htmlFor="confirmPass" className="label" style={{ margin: 0 }}>Confirm new password</label>
              <input
                id="confirmPass"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                disabled={isPending}
                required
                className="input"
                style={{ height: 48, fontSize: 16 }}
              />
            </div>

            {(fieldError ?? serverError) && (
              <div role="alert" className="alert" style={{ margin: 0 }}>
                {fieldError ?? serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn btn--primary"
              style={{ height: 48, fontSize: 16, marginTop: 4 }}
            >
              {isPending ? 'Saving…' : 'Set password & continue'}
            </button>
          </form>
        </div>

        {!showTempPasswordHint && (
          <Link to="/" className="btn btn--ghost" style={{ alignSelf: 'center' }}>Back to UniHub</Link>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordPage;
