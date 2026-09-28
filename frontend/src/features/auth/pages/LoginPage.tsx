import useLoginPage from '../hooks/useLoginPage';
import { academicYearOf } from '../../../utils/academicYear';

const FEATURES = [
  {
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2.5"/>
        <path d="M3 10h18M8 3v4M16 3v4"/>
      </svg>
    ),
    text: 'Weekly schedule with Google Meet links',
  },
  {
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>
      </svg>
    ),
    text: 'Course modules, resources and assignments',
  },
  {
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="5" width="19" height="14" rx="2.5"/>
        <path d="M2.5 10h19"/>
      </svg>
    ),
    text: 'Tuition in three tracked installments',
  },
];

/** Thin UI for the login screen — all logic lives in `useLoginPage`. */
const LoginPage = () => {
  const {
    email,
    password,
    fieldError,
    serverError,
    isPending,
    showPassword,
    onEmailChange,
    onPasswordChange,
    onSubmit,
    toggleShowPassword,
  } = useLoginPage();
  const hasError = !!(fieldError || serverError);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream-100)' }}>
      {/* ── Left hero panel (hidden on narrow screens) ── */}
      <div
        className="auth-hero"
        style={{
          width: 'min(620px, 45vw)',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          padding: '56px 56px 48px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'var(--orange-900)',
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -170, right: -170, width: 520, height: 520, borderRadius: 'var(--radius-full)', background: 'radial-gradient(circle, rgba(255, 107, 31, 0.55) 0%, rgba(255, 107, 31, 0) 70%)' }} aria-hidden="true" />
        <div style={{ position: 'absolute', bottom: -150, left: -120, width: 420, height: 420, borderRadius: 'var(--radius-full)', background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 68%)' }} aria-hidden="true" />

        {/* Logo */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8.2 12 4l9 4.2-9 4.2-9-4.2Z"/>
              <path d="M7.2 10.6V15c0 1.5 2.2 2.6 4.8 2.6s4.8-1.1 4.8-2.6v-4.4"/>
              <path d="M21 8.2v5.6"/>
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.02em' }}>UniHub</span>
        </div>

        {/* Headline + features */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 480 }}>
          <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.15, fontWeight: 600, color: 'var(--white)', letterSpacing: '-0.02em' }}>
            Everything the department runs on, in one place.
          </h1>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
            Schedule, course modules, assignments, session recaps and tuition — for every class group, every day of the year.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                </span>
                <span style={{ fontSize: 16, color: 'var(--white)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badge */}
        <div style={{ position: 'relative' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 28, padding: '0 12px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)', color: 'var(--white)', fontSize: 12, fontWeight: 600 }}>
            Academic year {academicYearOf(new Date())}
          </span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: 'var(--space-6)' }}>
        <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Card */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(24px, 5vw, 36px)', boxShadow: 'var(--shadow-float)', display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h2 style={{ margin: 0, fontSize: 24, lineHeight: '32px', fontWeight: 600, color: 'var(--ink-900)', letterSpacing: '-0.01em' }}>Sign in</h2>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--ink-500)' }}>Use the university email your department issued you.</p>
            </div>

            {/* Error alert */}
            {hasError && (
              <div role="alert" className="alert" style={{ margin: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger-700)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>
                  <path d="M12 9.2v4.1M12 17h.01"/>
                </svg>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--danger-700)' }}>
                  {fieldError ?? serverError}
                </span>
              </div>
            )}

            <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label htmlFor="login-email" className="label" style={{ margin: 0 }}>University email</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  placeholder="a.belkacem@univ.dz"
                  value={email}
                  onChange={e => onEmailChange(e.target.value)}
                  disabled={isPending}
                  className="input"
                  style={{ height: 48, fontSize: 16 }}
                />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label htmlFor="login-password" className="label" style={{ margin: 0 }}>Password</label>
                <div style={{ position: 'relative', display: 'flex' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => onPasswordChange(e.target.value)}
                    disabled={isPending}
                    className="input"
                    style={{ height: 48, fontSize: 16, paddingRight: 52 }}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={toggleShowPassword}
                    style={{ position: 'absolute', right: 2, top: 2, width: 44, height: 44, border: 0, background: 'transparent', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-500)' }}
                  >
                    {showPassword ? (
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1.8 12S5.3 5.8 12 5.8 22.2 12 22.2 12 18.7 18.2 12 18.2 1.8 12 1.8 12Z"/>
                        <circle cx="12" cy="12" r="3.1"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="btn btn--primary"
                style={{ height: 48, fontSize: 16, marginTop: 4 }}
              >
                {isPending ? 'Signing in…' : 'Sign in'}
              </button>

              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--ink-500)' }}>
                Signing in for the first time? You&apos;ll be asked to replace your temporary password before anything else opens.
              </p>
            </form>
          </div>

          <p style={{ margin: 0, textAlign: 'center', fontSize: 13, lineHeight: 1.55, color: 'var(--ink-500)' }}>
            Locked out? Only the department office can reset a password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
