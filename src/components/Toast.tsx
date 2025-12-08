import { useToast } from '../contexts';
import './Toast.css';

export function ToastManager() {
  const { toasts, removeToast } = useToast();
  
  if (toasts.length === 0) {
    return null;
  }
  
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-item--${toast.type}`}>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
