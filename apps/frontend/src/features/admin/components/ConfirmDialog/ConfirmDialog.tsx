import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  subtitle,
  cancelText = '취소',
  confirmText = '확인',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="confirm-dialog-overlay" onClick={handleOverlayClick}>
      <div className="confirm-dialog">
        <div className="confirm-dialog__content">
          <h3 className="confirm-dialog__title">{title}</h3>
          {subtitle && (
            <p className="confirm-dialog__subtitle">{subtitle}</p>
          )}
        </div>
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="confirm-dialog__button confirm-dialog__button--cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="confirm-dialog__button confirm-dialog__button--confirm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
