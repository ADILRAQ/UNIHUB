import { useState } from 'react';
import useLoginPage from '../hooks/useLoginPage';

const FEATURES = [
  {
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2.5"/>
        <path d="M3 10h18M8 3v4M16 3v4"/>
      </svg>
    ),
    text: 'Weekly schedule with Google Meet links',
  },
  {
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>
      </svg>
    ),
    text: 'Course modules, resources and assignments',
  },
  {
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
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
    onEmailChange,
    onPasswordChange,
    onSubmit,
  } = useLoginPage();

  const [showPassword, setShowPassword] = useState(false);
  const hasError = !!(fieldError || serverError);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F7FF' }}>
      {/* ── Left hero panel ── */}
      <div
        style={{
          width: 620,
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          padding: '56px 56px 48px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(155deg, #3B33AE 0%, #4A41C9 48%, #6156E6 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -170, right: -170, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 68%)' }} />
        <div style={{ position: 'absolute', bottom: -150, left: -120, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,0.30) 0%, rgba(255,107,107,0) 70%)' }} />

        {/* Logo */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8.2 12 4l9 4.2-9 4.2-9-4.2Z"/>
              <path d="M7.2 10.6V15c0 1.5 2.2 2.6 4.8 2.6s4.8-1.1 4.8-2.6v-4.4"/>
              <path d="M21 8.2v5.6"/>
            </svg>
          </div>
          <span style={{ fontSize: 21, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>UniHub</span>
        </div>

        {/* Headline + features */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 480 }}>
          <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.14, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em' }}>
            Everything the department runs on, in one place.
          </h1>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
            Schedule, course modules, assignments, session recaps and tuition — for every class group, every day of the year.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 10, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                </span>
                <span style={{ fontSize: 15, color: '#FFFFFF' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badge */}
        <div style={{ position: 'relative' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 28, padding: '0 12px', borderRadius: 999, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)', color: '#FFFFFF', fontSize: 12.5, fontWeight: 600 }}>
            Academic year 2026–2027
          </span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: 56 }}>
        <div style={{ width: 440, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 20, padding: 36, boxShadow: '0 1px 2px rgba(108,99,255,0.06), 0 18px 44px rgba(108,99,255,0.12)', display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#1F1B33', letterSpacing: '-0.02em' }}>Sign in</h2>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: '#6B6B7B' }}>Use the university email your department issued you.</p>
            </div>

            {/* Error alert */}
            {hasError && (
              <div role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 10, padding: '12px 14px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>
                  <path d="M12 9.2v4.1M12 17h.01"/>
                </svg>
                <span style={{ fontSize: 13.5, lineHeight: 1.5, color: '#B91C1C' }}>
                  {fieldError ?? serverError}
                </span>
              </div>
            )}

            <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label htmlFor="login-email" style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>University email</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  placeholder="a.belkacem@univ.dz"
                  value={email}
                  onChange={e => onEmailChange(e.target.value)}
                  disabled={isPending}
                  style={{ height: 48, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 10, background: '#FFFFFF', padding: '0 14px', fontSize: 15, color: '#1F1B33', outline: 'none', width: '100%' }}
                />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label htmlFor="login-password" style={{ fontSize: 13, fontWeight: 600, color: '#45435A' }}>Password</label>
                <div style={{ position: 'relative', display: 'flex' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => onPasswordChange(e.target.value)}
                    disabled={isPending}
                    style={{ height: 48, width: '100%', boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 10, background: '#FFFFFF', padding: '0 52px 0 14px', fontSize: 15, color: '#1F1B33', outline: 'none' }}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: 2, top: 2, width: 44, height: 44, border: 0, background: 'transparent', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B6B7B' }}
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
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 10, background: isPending ? '#8A84E8' : '#5A4FE0', color: '#FFFFFF', fontSize: 15.5, fontWeight: 600, border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', boxShadow: '0 6px 16px rgba(108,99,255,0.28)', marginTop: 4 }}
              >
                {isPending ? 'Signing in…' : 'Sign in'}
              </button>

              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: '#6B6B7B' }}>
                Signing in for the first time? You&apos;ll be asked to replace your temporary password before anything else opens.
              </p>
            </form>
          </div>

          <p style={{ margin: 0, textAlign: 'center', fontSize: 13, lineHeight: 1.55, color: '#6B6B7B' }}>
            Locked out? Only the department office can reset a password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
