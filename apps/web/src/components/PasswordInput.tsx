import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/** Password field with an accessible show/hide toggle. */
export default function PasswordInput({ value, onChange, placeholder, required, autoComplete = 'current-password', name }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  name?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="password-field">
      <input
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
      />
      <button
        type="button"
        className="password-toggle"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible(current => !current)}
      >
        {visible ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
      </button>
    </span>
  );
}
