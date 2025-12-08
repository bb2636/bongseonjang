import styled, { css } from 'styled-components';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles = {
  primary: css`
    background-color: var(--color-primary);
    color: var(--color-white);
    border: none;
    
    &:hover:not(:disabled) {
      background-color: var(--color-primary-dark);
    }
  `,
  secondary: css`
    background-color: var(--color-light);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    
    &:hover:not(:disabled) {
      background-color: var(--color-background-secondary);
    }
  `,
  danger: css`
    background-color: var(--color-danger);
    color: var(--color-white);
    border: none;
    
    &:hover:not(:disabled) {
      background-color: #c82333;
    }
  `,
  ghost: css`
    background-color: transparent;
    color: var(--color-primary);
    border: none;
    
    &:hover:not(:disabled) {
      background-color: var(--color-light);
    }
  `,
};

const sizeStyles = {
  small: css`
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-small);
  `,
  medium: css`
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-base);
  `,
  large: css`
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-large);
  `,
};

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $isLoading: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all var(--transition-fast);
  cursor: pointer;
  
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${({ $isLoading }) => $isLoading && css`
    pointer-events: none;
    opacity: 0.7;
  `}
`;

export function Button({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $isLoading={isLoading}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </StyledButton>
  );
}
