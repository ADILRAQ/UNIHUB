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
 * Labeled text input shared by the auth pages (login + change-password).
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
    <div className="form-group">
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        className="input"
        type={type}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required={required}
      />
    </div>
  );
};

export default AuthField;
