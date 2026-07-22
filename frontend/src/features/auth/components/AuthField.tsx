import type { HTMLInputAutoCompleteAttribute } from 'react';

interface AuthFieldProps {
  label: string;
  type: 'email' | 'password' | 'text';
  name: string;
  autoComplete: HTMLInputAutoCompleteAttribute;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Labeled text input shared by the auth pages (login + change-password). Renders
 * the exact `auth-field` markup both pages used, so factoring it out removes the
 * duplicated label/input boilerplate without changing the DOM or styling.
 */
const AuthField = ({
  label,
  type,
  name,
  autoComplete,
  value,
  onChange,
  disabled = false,
  required = false,
}: AuthFieldProps) => {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required={required}
      />
    </label>
  );
};

export default AuthField;
