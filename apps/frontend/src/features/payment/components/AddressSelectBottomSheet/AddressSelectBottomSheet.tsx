import { AddressResponse } from '../../../address/api/addressApi';
import './AddressSelectBottomSheet.css';

interface AddressSelectBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: AddressResponse[];
  selectedAddressId: string | null;
  onSelect: (address: AddressResponse) => void;
  onEdit?: (address: AddressResponse) => void;
  onAddNew?: () => void;
}

export default function AddressSelectBottomSheet({
  isOpen,
  onClose,
  addresses,
  selectedAddressId,
  onSelect,
  onEdit,
  onAddNew,
}: AddressSelectBottomSheetProps) {
  const handleAddressClick = (address: AddressResponse) => {
    onSelect(address);
    onClose();
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const handleEditClick = (event: React.MouseEvent, address: AddressResponse) => {
    event.stopPropagation();
    if (onEdit) {
      onEdit(address);
    }
  };

  return (
    <>
      <div
        className={`address-select-sheet__overlay ${isOpen ? 'address-select-sheet__overlay--visible' : ''}`}
        onClick={onClose}
      />
      <div className={`address-select-sheet ${isOpen ? 'address-select-sheet--visible' : ''}`}>
        <div className="address-select-sheet__header">
          <div className="address-select-sheet__header-spacer" />
          <span className="address-select-sheet__title">배송지 선택</span>
          <button
            type="button"
            className="address-select-sheet__close-button"
            onClick={onClose}
          >
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path
                d="M6.5 6.5L19.5 19.5M19.5 6.5L6.5 19.5"
                stroke="rgba(12, 12, 12, 0.9)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="address-select-sheet__content">
          {addresses.map((address) => {
            const isSelected = address.id === selectedAddressId;
            return (
              <div
                key={address.id}
                className="address-select-sheet__item"
                onClick={() => handleAddressClick(address)}
              >
                <div className={`address-select-sheet__radio ${isSelected ? 'address-select-sheet__radio--selected' : ''}`}>
                  {isSelected && <div className="address-select-sheet__radio-inner" />}
                </div>
                <div className="address-select-sheet__info">
                  <div className="address-select-sheet__name-row">
                    <div className="address-select-sheet__name-label">
                      <span className="address-select-sheet__name">{address.addressName}</span>
                      {address.isDefault && (
                        <span className="address-select-sheet__default-tag">기본배송지</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="address-select-sheet__edit-button"
                      onClick={(e) => handleEditClick(e, address)}
                    >
                      수정
                    </button>
                  </div>
                  <div className="address-select-sheet__details">
                    <p className="address-select-sheet__detail-text">
                      ({address.postalCode}) {address.address} {address.addressDetail}
                    </p>
                    <p className="address-select-sheet__detail-text">
                      {formatPhoneNumber(address.recipientPhone)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="address-select-sheet__footer">
          <button
            type="button"
            className="address-select-sheet__add-button"
            onClick={() => {
              onClose();
              if (onAddNew) {
                onAddNew();
              }
            }}
          >
            새 배송지 추가
          </button>
        </div>
      </div>
    </>
  );
}
