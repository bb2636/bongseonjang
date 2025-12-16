import type { MouseEvent } from 'react';
import './AlertModal.css';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  confirmText?: string;
}

export function AlertModal({ 
  isOpen, 
  title, 
  onConfirm, 
  confirmText = '확인' 
}: AlertModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onConfirm();
    }
  };

  return (
    <div className="alert-modal-overlay" onClick={handleOverlayClick}>
      <div className="alert-modal-container">
        <div className="alert-modal-header">
          <span className="alert-modal-title">{title}</span>
        </div>
        <div className="alert-modal-buttons">
          <button className="alert-modal-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
