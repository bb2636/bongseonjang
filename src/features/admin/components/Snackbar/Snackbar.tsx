import { useEffect } from 'react';
import './Snackbar.css';

interface SnackbarProps {
  isOpen: boolean;
  title: string;
  details?: string[];
  duration?: number;
  onClose: () => void;
}

export function Snackbar({
  isOpen,
  title,
  details,
  duration = 3000,
  onClose,
}: SnackbarProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="snackbar">
      <div className="snackbar__container">
        <div className="snackbar__header">
          <div className="snackbar__title-wrapper">
            <div className="snackbar__icon">
              <svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="10.88" cy="13.43" rx="9.01" ry="9.29" fill="#3B9BD5"/>
                <ellipse cx="2.25" cy="12.78" rx="1.93" ry="2.66" fill="#3B9BD5"/>
                <ellipse cx="19.38" cy="12.78" rx="1.93" ry="2.66" fill="#3B9BD5"/>
                <circle cx="7.5" cy="10" r="1.5" fill="white"/>
                <circle cx="14.5" cy="10" r="1.5" fill="white"/>
                <path d="M7.5 15.5C7.5 15.5 9 17.5 11 17.5C13 17.5 14.5 15.5 14.5 15.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="snackbar__title">{title}</span>
          </div>
          <button
            type="button"
            className="snackbar__close"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        {details && details.length > 0 && (
          <div className="snackbar__details">
            {details.map((detail, index) => (
              <p key={index} className="snackbar__detail-item">
                {detail}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
