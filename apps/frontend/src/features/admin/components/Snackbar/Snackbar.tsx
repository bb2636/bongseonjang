import { useEffect } from 'react';
import successImage from '@assets/image/sucess.svg';
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
              <img src={successImage} alt="" width="22" height="24" />
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
