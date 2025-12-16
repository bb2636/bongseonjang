import { InputHTMLAttributes, forwardRef, useState } from 'react';
import './PasswordInput.css';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string | null;
  fullWidth?: boolean;
  showPassword?: boolean;
  onToggleVisibility?: () => void;
}

const EyeOpenIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 4.5C6 4.5 2.73 7.61 1 11C2.73 14.39 6 17.5 11 17.5C16 17.5 19.27 14.39 21 11C19.27 7.61 16 4.5 11 4.5ZM11 15C8.79 15 7 13.21 7 11C7 8.79 8.79 7 11 7C13.21 7 15 8.79 15 11C15 13.21 13.21 15 11 15ZM11 9C9.9 9 9 9.9 9 11C9 12.1 9.9 13 11 13C12.1 13 13 12.1 13 11C13 9.9 12.1 9 11 9Z" fill="rgba(12, 12, 12, 0.4)"/>
  </svg>
);

const EyeClosedIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 6C13.76 6 16 8.24 16 11C16 11.65 15.87 12.26 15.64 12.83L18.56 15.75C20.07 14.49 21.26 12.86 21.99 11C20.26 6.61 15.99 3.5 10.99 3.5C9.59 3.5 8.25 3.75 7.01 4.2L9.17 6.36C9.74 6.13 10.35 6 11 6ZM1 2.27L3.74 5.01C2.06 6.3 0.74 8.07 0 10.99C1.73 15.38 6 18.5 11 18.5C12.55 18.5 14.03 18.2 15.38 17.66L18.73 21L20 19.73L2.27 1L1 2.27ZM6.53 7.8L8.08 9.35C8.03 9.56 8 9.78 8 10C8 11.66 9.34 13 11 13C11.22 13 11.44 12.97 11.65 12.92L13.2 14.47C12.53 14.8 11.79 15 11 15C8.24 15 6 12.76 6 10C6 9.21 6.2 8.47 6.53 7.8ZM10.84 7.02L13.99 10.17L14.01 10.01C14.01 8.35 12.67 7.01 11.01 7.01L10.84 7.02Z" fill="rgba(12, 12, 12, 0.4)"/>
  </svg>
);

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ 
    label, 
    error, 
    fullWidth = true, 
    showPassword: controlledShowPassword,
    onToggleVisibility,
    id, 
    className = '', 
    ...props 
  }, ref) => {
    const [internalShowPassword, setInternalShowPassword] = useState(false);
    
    const isControlled = controlledShowPassword !== undefined && onToggleVisibility !== undefined;
    const showPassword = isControlled ? controlledShowPassword : internalShowPassword;
    
    const handleToggle = () => {
      if (isControlled) {
        onToggleVisibility?.();
      } else {
        setInternalShowPassword(prev => !prev);
      }
    };
    
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    const wrapperClasses = [
      'password-input-wrapper',
      fullWidth && 'password-input-wrapper--full-width',
    ].filter(Boolean).join(' ');

    const inputBoxClasses = [
      'password-input-box',
      error && 'password-input-box--error',
    ].filter(Boolean).join(' ');

    const inputClasses = [
      'password-input-field',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        {label && <label className="password-input-label" htmlFor={inputId}>{label}</label>}
        <div className={inputBoxClasses}>
          <div className="password-input-row">
            <input
              ref={ref}
              id={inputId}
              type={showPassword ? 'text' : 'password'}
              className={inputClasses}
              {...props}
            />
            <button
              className="password-visibility-toggle"
              type="button"
              onClick={handleToggle}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </button>
          </div>
          {error && <span className="password-input-error">{error}</span>}
        </div>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
