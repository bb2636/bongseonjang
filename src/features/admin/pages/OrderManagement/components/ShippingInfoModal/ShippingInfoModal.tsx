import { useState, useEffect } from 'react';
import { CustomDropdown } from '../../../../../../components';
import './ShippingInfoModal.css';

interface CourierOption {
  id: string;
  name: string;
}

const COURIER_OPTIONS: CourierOption[] = [
  { id: 'cj', name: 'CJ대한통운' },
  { id: 'hanjin', name: '한진택배' },
  { id: 'lotte', name: '롯데택배' },
  { id: 'logen', name: '로젠택배' },
  { id: 'post', name: '우체국택배' },
  { id: 'gs', name: 'GS25편의점택배' },
  { id: 'cu', name: 'CU편의점택배' },
  { id: 'kyungdong', name: '경동택배' },
  { id: 'daesin', name: '대신택배' },
];

interface ShippingInfoModalProps {
  isOpen: boolean;
  orderId: string;
  orderNumber: string;
  currentCarrier: string | null;
  currentTrackingNumber: string | null;
  onClose: () => void;
  onSave: (orderId: string, carrierId: string, carrierName: string, trackingNumber: string) => Promise<void>;
}

export function ShippingInfoModal({
  isOpen,
  orderId,
  orderNumber,
  currentCarrier,
  currentTrackingNumber,
  onClose,
  onSave,
}: ShippingInfoModalProps) {
  const [selectedCarrierId, setSelectedCarrierId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentOption = COURIER_OPTIONS.find(opt => opt.name === currentCarrier);
      setSelectedCarrierId(currentOption?.id || null);
      setTrackingNumber(currentTrackingNumber || '');
    }
  }, [isOpen, currentCarrier, currentTrackingNumber]);

  const handleSave = async () => {
    if (!selectedCarrierId || !trackingNumber.trim()) {
      return;
    }

    const selectedOption = COURIER_OPTIONS.find(opt => opt.id === selectedCarrierId);
    if (!selectedOption) return;

    setIsSaving(true);
    try {
      await onSave(orderId, selectedCarrierId, selectedOption.name, trackingNumber.trim());
      onClose();
    } catch (error) {
      console.error('Failed to save shipping info:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isValid = selectedCarrierId && trackingNumber.trim();

  return (
    <div className="shipping-modal-overlay" onClick={handleOverlayClick}>
      <div className="shipping-modal">
        <div className="shipping-modal__header">
          <h2 className="shipping-modal__title">택배사 정보 입력</h2>
          <button
            type="button"
            className="shipping-modal__close"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 5.5L5.5 16.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.5 5.5L16.5 16.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="shipping-modal__content">
          <div className="shipping-modal__order-info">
            <span className="shipping-modal__order-label">주문번호</span>
            <span className="shipping-modal__order-value">{orderNumber}</span>
          </div>

          <div className="shipping-modal__field">
            <label className="shipping-modal__label">택배사 선택</label>
            <CustomDropdown
              options={COURIER_OPTIONS}
              value={selectedCarrierId}
              onChange={(id) => setSelectedCarrierId(id as string)}
              placeholder="선택"
            />
          </div>

          <div className="shipping-modal__field">
            <label className="shipping-modal__label">송장번호</label>
            <div className="shipping-modal__input-wrapper">
              <input
                type="text"
                className="shipping-modal__input"
                placeholder="입력해주세요"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="shipping-modal__footer">
          <button
            type="button"
            className="shipping-modal__button shipping-modal__button--cancel"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className="shipping-modal__button shipping-modal__button--save"
            onClick={handleSave}
            disabled={!isValid || isSaving}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
