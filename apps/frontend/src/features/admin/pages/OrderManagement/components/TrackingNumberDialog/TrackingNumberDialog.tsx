import { useState, useEffect } from 'react';
import './TrackingNumberDialog.css';

interface TrackingNumberDialogProps {
  isOpen: boolean;
  currentValue: string;
  onClose: () => void;
  onSave: (trackingNumber: string) => void;
  isSaving?: boolean;
}

export function TrackingNumberDialog({
  isOpen,
  currentValue,
  onClose,
  onSave,
  isSaving = false,
}: TrackingNumberDialogProps) {
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTrackingNumber(currentValue || '');
    }
  }, [isOpen, currentValue]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSave = () => {
    if (trackingNumber.trim()) {
      onSave(trackingNumber.trim());
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && trackingNumber.trim()) {
      handleSave();
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tracking-dialog-overlay" onClick={handleOverlayClick}>
      <div className="tracking-dialog">
        <div className="tracking-dialog__header">
          <h2 className="tracking-dialog__title">송장번호 입력</h2>
          <button
            type="button"
            className="tracking-dialog__close"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 5.5L5.5 16.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.5 5.5L16.5 16.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="tracking-dialog__content">
          <div className="tracking-dialog__field">
            <label className="tracking-dialog__label">송장번호</label>
            <div className="tracking-dialog__input-wrapper">
              <input
                type="text"
                inputMode="numeric"
                className="tracking-dialog__input"
                placeholder="송장번호를 입력해주세요"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.replace(/\D/g, ''))}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="tracking-dialog__footer">
          <button
            type="button"
            className="tracking-dialog__button tracking-dialog__button--cancel"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className="tracking-dialog__button tracking-dialog__button--save"
            onClick={handleSave}
            disabled={!trackingNumber.trim() || isSaving}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
