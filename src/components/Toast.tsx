import styled, { keyframes } from 'styled-components';
import { useToast } from '../contexts';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const ToastItem = styled.div<{ $type: 'success' | 'error' | 'warning' | 'info' }>`
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  animation: ${slideIn} var(--transition-normal) ease-out;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 300px;
  max-width: 400px;
  
  background-color: ${({ $type }) => {
    switch ($type) {
      case 'success': return 'var(--color-success)';
      case 'error': return 'var(--color-danger)';
      case 'warning': return 'var(--color-warning)';
      case 'info': return 'var(--color-info)';
    }
  }};
  
  color: ${({ $type }) => $type === 'warning' ? 'var(--color-dark)' : 'var(--color-white)'};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 1.25rem;
  line-height: 1;
  margin-left: auto;
  padding: 0;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const Message = styled.span`
  flex: 1;
`;

export function ToastManager() {
  const { toasts, removeToast } = useToast();
  
  if (toasts.length === 0) {
    return null;
  }
  
  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} $type={toast.type}>
          <Message>{toast.message}</Message>
          <CloseButton onClick={() => removeToast(toast.id)}>
            &times;
          </CloseButton>
        </ToastItem>
      ))}
    </ToastContainer>
  );
}
