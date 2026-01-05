import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { AlertModal } from '../components/AlertModal';

interface AlertModalState {
  isOpen: boolean;
  title: string;
  redirectTo?: string;
}

interface AlertModalContextType {
  showAlert: (title: string, onConfirm?: () => void) => void;
}

const AlertModalContext = createContext<AlertModalContextType | undefined>(undefined);

interface AlertModalProviderProps {
  children: ReactNode;
}

const GLOBAL_ALERT_EVENT = 'global-alert-modal';

interface GlobalAlertEventDetail {
  title: string;
  redirectTo?: string;
}

export function triggerGlobalAlert(title: string, redirectTo?: string): void {
  window.dispatchEvent(
    new CustomEvent<GlobalAlertEventDetail>(GLOBAL_ALERT_EVENT, {
      detail: { title, redirectTo },
    })
  );
}

export function AlertModalProvider({ children }: AlertModalProviderProps) {
  const [modalState, setModalState] = useState<AlertModalState>({
    isOpen: false,
    title: '',
  });
  const onConfirmRef = useRef<(() => void) | undefined>(undefined);

  const showAlert = useCallback((title: string, onConfirm?: () => void) => {
    onConfirmRef.current = onConfirm;
    setModalState({
      isOpen: true,
      title,
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const redirectTo = modalState.redirectTo;
    const onConfirmCallback = onConfirmRef.current;
    
    setModalState({ isOpen: false, title: '', redirectTo: undefined });
    onConfirmRef.current = undefined;
    
    if (redirectTo) {
      window.location.href = redirectTo;
    } else if (onConfirmCallback) {
      onConfirmCallback();
    }
  }, [modalState.redirectTo]);

  useEffect(() => {
    const handleGlobalAlert = (event: CustomEvent<GlobalAlertEventDetail>) => {
      const { title, redirectTo } = event.detail;
      onConfirmRef.current = undefined;
      setModalState({
        isOpen: true,
        title,
        redirectTo,
      });
    };

    window.addEventListener(GLOBAL_ALERT_EVENT, handleGlobalAlert as EventListener);

    return () => {
      window.removeEventListener(GLOBAL_ALERT_EVENT, handleGlobalAlert as EventListener);
    };
  }, []);

  const value: AlertModalContextType = {
    showAlert,
  };

  return (
    <AlertModalContext.Provider value={value}>
      {children}
      <AlertModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        onConfirm={handleConfirm}
      />
    </AlertModalContext.Provider>
  );
}

export function useAlertModal(): AlertModalContextType {
  const context = useContext(AlertModalContext);

  if (context === undefined) {
    throw new Error('useAlertModal must be used within an AlertModalProvider');
  }

  return context;
}
