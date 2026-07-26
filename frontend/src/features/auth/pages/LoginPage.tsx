import useLoginPage from '../hooks/useLoginPage';
import AuthField from '../components/AuthField';
import AuthErrorMessage from '../components/AuthErrorMessage';

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

  return (
    <div className="auth-split">
      <section className="auth-split__hero" aria-hidden="true">
        <div className="auth-hero__logo">UH</div>
        <h1 className="auth-hero__title">UniHub</h1>
        <p className="auth-hero__subtitle">
          Your university department, all in one place.
        </p>
        <ul className="auth-hero__features">
          <li>Announcements &amp; class calendar</li>
          <li>Course resources &amp; assignments</li>
          <li>Session recaps for missed classes</li>
          <li>Tuition payment tracking</li>
        </ul>
      </section>

      <div className="auth-split__form">
        <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ margin: '0 0 var(--space-6)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', letterSpacing: '-0.02em' }}>
            Sign in
          </h2>

          <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <AuthField
              label="Email"
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={onEmailChange}
              disabled={isPending}
              required
            />

            <AuthField
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={onPasswordChange}
              disabled={isPending}
              required
            />

            <AuthErrorMessage message={fieldError} />
            <AuthErrorMessage message={serverError} />

            <button type="submit" className="btn btn--primary w-full" disabled={isPending}>
              {isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
