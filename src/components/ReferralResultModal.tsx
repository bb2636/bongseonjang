import type { MouseEvent } from 'react';
import './ReferralResultModal.css';

interface ReferralResultModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}

export default function ReferralResultModal({ isOpen, message, onConfirm }: ReferralResultModalProps) {
  if (!isOpen) return null;

  const handleContainerClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="referral-modal-overlay" onClick={onConfirm}>
      <div className="referral-modal-container" onClick={handleContainerClick}>
        <div className="referral-modal-header">
          <div className="referral-modal-header-content">
            <span className="referral-modal-text">{message}</span>
          </div>
        </div>
        <div className="referral-modal-buttons">
          <button className="referral-modal-confirm" onClick={onConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
}
