import useTempPasswordPanel from '../hooks/useTempPasswordPanel';

interface TempPasswordPanelProps {
  /** The one-time temporary password to display. */
  password: string;
  /** Optional identity line, e.g. the email the password belongs to. */
  email?: string;
  /** Heading shown above the credential. */
  title?: string;
}

/**
 * Reusable "shown once" credential panel shared by the Add-user and
 * Reset-password flows. Presents the generated temporary password prominently
 * with a copy button and a note that it will not be shown again. Purely
 * presentational — copy behavior lives in `useTempPasswordPanel`.
 */
const TempPasswordPanel = ({
  password,
  email,
  title = 'Temporary password',
}: TempPasswordPanelProps) => {
  const { copied, onCopy } = useTempPasswordPanel(password);

  return (
    <div className="temp-password" role="status">
      <p className="temp-password__title">{title}</p>
      {email && (
        <p className="temp-password__email">
          for <strong>{email}</strong>
        </p>
      )}
      <div className="temp-password__row">
        <code className="temp-password__value">{password}</code>
        <button type="button" className="admin-button" onClick={onCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="temp-password__note">
        This password is shown only once. Copy it now and share it with the user — it cannot
        be retrieved again.
      </p>
    </div>
  );
};

export default TempPasswordPanel;
