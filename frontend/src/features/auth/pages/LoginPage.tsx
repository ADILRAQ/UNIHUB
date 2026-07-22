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
    <main className="auth-screen">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h1 className="auth-card__title">Sign in to UniHub</h1>

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

        <button type="submit" className="auth-button" disabled={isPending}>
          {isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
};

export default LoginPage;
