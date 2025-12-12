import type { MouseEvent } from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmColor?: 'primary' | 'danger';
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  onCancel,
  onConfirm, 
  cancelText = '취소',
  confirmText = '확인',
  confirmColor = 'primary',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-modal-container">
        <div className="confirm-modal-header">
          <span className="confirm-modal-title">{title}</span>
        </div>
        <div className="confirm-modal-buttons">
          <button className="confirm-modal-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`confirm-modal-confirm confirm-modal-confirm--${confirmColor}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
