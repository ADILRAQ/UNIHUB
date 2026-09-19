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
    <div style={{ minHeight: '100vh', background: '#F8F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: 24 }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -220, right: -180, width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.14) 0%, rgba(108,99,255,0) 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -200, left: -160, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,0.10) 0%, rgba(255,107,107,0) 70%)', pointerEvents: 'none' }} />

      <div style={{ width: 460, display: 'flex', flexDirection: 'column', gap: 22, position: 'relative' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(140deg, #6C63FF, #4A41C9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8.2 12 4l9 4.2-9 4.2-9-4.2Z"/><path d="M7.2 10.6V15c0 1.5 2.2 2.6 4.8 2.6s4.8-1.1 4.8-2.6v-4.4"/>
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1F1B33', letterSpacing: '-0.02em' }}>UniHub</span>
        </div>

        {/* Card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 20, padding: 40, boxShadow: '0 1px 2px rgba(108,99,255,0.06), 0 18px 44px rgba(108,99,255,0.12)', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: '#EEEDFF', color: '#4A41C9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>
              </svg>
            </span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1F1B33', letterSpacing: '-0.02em' }}>Set a new password</h1>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#6B6B7B' }}>
              {showTempPasswordHint
                ? "You're signing in with a temporary password. Choose a new one before continuing — this is required for every new account."
                : 'Choose a new password for your account.'}
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label htmlFor="curPass" style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>
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
                style={{ height: 48, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 10, background: '#FFFFFF', padding: '0 14px', fontSize: 15, color: '#1F1B33', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label htmlFor="newPass" style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>New password</label>
              <input
                id="newPass"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                disabled={isPending}
                required
                style={{ height: 48, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 10, background: '#FFFFFF', padding: '0 14px', fontSize: 15, color: '#1F1B33', outline: 'none', fontFamily: 'inherit' }}
              />
              {newPassword.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {hasMinLength ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6.5 9 17.5l-5-5"/></svg>
                    ) : (
                      <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1.6px solid #C9C7DA', flexShrink: 0, display: 'inline-block' }} />
                    )}
                    <span style={{ fontSize: 12, color: hasMinLength ? '#45435A' : '#8D8B9C' }}>At least 8 characters</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {hasNumberOrSymbol ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6.5 9 17.5l-5-5"/></svg>
                    ) : (
                      <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1.6px solid #C9C7DA', flexShrink: 0, display: 'inline-block' }} />
                    )}
                    <span style={{ fontSize: 12, color: hasNumberOrSymbol ? '#45435A' : '#8D8B9C' }}>One number or symbol</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label htmlFor="confirmPass" style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>Confirm new password</label>
              <input
                id="confirmPass"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                disabled={isPending}
                required
                style={{ height: 48, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 10, background: '#FFFFFF', padding: '0 14px', fontSize: 15, color: '#1F1B33', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            {(fieldError ?? serverError) && (
              <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, color: '#B91C1C' }}>
                {fieldError ?? serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 10, background: isPending ? '#8A84E8' : '#5A4FE0', color: '#FFFFFF', fontSize: 15.5, fontWeight: 600, border: 0, cursor: isPending ? 'not-allowed' : 'pointer', boxShadow: '0 6px 16px rgba(108,99,255,0.28)', marginTop: 4, fontFamily: 'inherit' }}
            >
              {isPending ? 'Saving…' : 'Set password & continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
