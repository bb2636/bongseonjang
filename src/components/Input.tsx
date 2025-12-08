import styled, { css } from 'styled-components';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const InputWrapper = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}
`;

const Label = styled.label`
  font-size: var(--font-size-small);
  font-weight: 500;
  color: var(--color-text-primary);
`;

const StyledInput = styled.input<{ $hasError: boolean }>`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid ${({ $hasError }) => 
    $hasError ? 'var(--color-danger)' : 'var(--color-border)'};
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: var(--color-white);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  
  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => 
      $hasError ? 'var(--color-danger)' : 'var(--color-primary)'};
    box-shadow: 0 0 0 3px ${({ $hasError }) => 
      $hasError ? 'rgba(220, 53, 69, 0.25)' : 'rgba(0, 123, 255, 0.25)'};
  }
  
  &::placeholder {
    color: var(--color-text-muted);
  }
  
  &:disabled {
    background-color: var(--color-background-secondary);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  font-size: var(--font-size-small);
  color: var(--color-danger);
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <InputWrapper $fullWidth={fullWidth}>
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <StyledInput
          ref={ref}
          id={inputId}
          $hasError={!!error}
          {...props}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </InputWrapper>
    );
  }
);

Input.displayName = 'Input';
