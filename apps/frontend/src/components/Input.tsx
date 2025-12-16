import { InputHTMLAttributes, forwardRef } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, id, className = '', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    const wrapperClasses = [
      'input-wrapper',
      fullWidth && 'input-wrapper--full-width',
    ].filter(Boolean).join(' ');

    const inputBoxClasses = [
      'input-box',
      error && 'input-box--error',
    ].filter(Boolean).join(' ');

    const inputClasses = [
      'input-field',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        {label && <label className="input-label" htmlFor={inputId}>{label}</label>}
        <div className={inputBoxClasses}>
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            {...props}
          />
          {error && <span className="input-error">{error}</span>}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
