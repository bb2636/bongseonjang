import { useCallback, useState, useRef, useEffect } from 'react';
import { checkIsCapacitor } from '@/shared/config/apiConfig';
import './AddressInputForm.css';

export interface AddressData {
  addressName: string;
  postalCode: string;
  address: string;
  addressDetail: string;
}

interface AddressInputFormProps {
  addressName: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  onAddressNameChange: (value: string) => void;
  onAddressDetailChange: (value: string) => void;
  onAddressSearch: (postalCode: string, address: string) => void;
  onAddressNameBlur?: () => void;
  onAddressDetailBlur?: () => void;
  errors?: {
    addressName?: string;
    address?: string;
  };
  onSearchError?: (message: string) => void;
  showLabel?: boolean;
  label?: string;
}

export function AddressInputForm({
  addressName,
  postalCode,
  address,
  addressDetail,
  onAddressNameChange,
  onAddressDetailChange,
  onAddressSearch,
  onAddressNameBlur,
  onAddressDetailBlur,
  errors = {},
  onSearchError,
  showLabel = true,
  label = '배송지',
}: AddressInputFormProps) {
  const [showAddressLayer, setShowAddressLayer] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const isCapacitor = checkIsCapacitor();

  const handleAddressSearch = useCallback(() => {
    if (!window.daum?.Postcode) {
      onSearchError?.('주소 검색 서비스를 불러오지 못했습니다. 페이지를 새로고침 해주세요.');
      return;
    }

    if (isCapacitor) {
      setShowAddressLayer(true);
    } else {
      new window.daum.Postcode({
        oncomplete: (data) => {
          const selectedAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
          onAddressSearch(data.zonecode, selectedAddress);
        },
      }).open();
    }
  }, [onAddressSearch, onSearchError, isCapacitor]);

  useEffect(() => {
    if (showAddressLayer && layerRef.current && window.daum?.Postcode) {
      new window.daum.Postcode({
        oncomplete: (data) => {
          const selectedAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
          onAddressSearch(data.zonecode, selectedAddress);
          setShowAddressLayer(false);
        },
        onclose: () => {
          setShowAddressLayer(false);
        },
        width: '100%',
        height: '100%',
      }).embed(layerRef.current);
    }
  }, [showAddressLayer, onAddressSearch]);

  const handleCloseLayer = useCallback(() => {
    setShowAddressLayer(false);
  }, []);

  const getInputBoxClass = (hasError: boolean, isFull = false) => {
    let className = 'address-input-form__input-box';
    if (isFull) className += ' address-input-form__input-box--full';
    if (hasError) className += ' address-input-form__input-box--error';
    return className;
  };

  return (
    <div className="address-input-form">
      {showLabel && <label className="address-input-form__label">{label}</label>}
      <div className="address-input-form__section">
        <div className={getInputBoxClass(!!errors.addressName, true)}>
          <input
            className="address-input-form__input"
            type="text"
            placeholder="배송지 이름 (예: 집, 회사)"
            value={addressName}
            onChange={(e) => onAddressNameChange(e.target.value)}
            onBlur={onAddressNameBlur}
          />
        </div>
        {errors.addressName && (
          <span className="address-input-form__error">{errors.addressName}</span>
        )}
        <div className="address-input-form__row">
          <div className={getInputBoxClass(!!errors.address)}>
            <input
              className="address-input-form__input"
              type="text"
              placeholder="우편번호"
              value={postalCode}
              readOnly
            />
          </div>
          <button
            type="button"
            className="address-input-form__search-button"
            onClick={handleAddressSearch}
          >
            주소 검색
          </button>
        </div>
        <div className={getInputBoxClass(!!errors.address, true)}>
          <input
            className="address-input-form__input"
            type="text"
            placeholder="기본주소"
            value={address}
            readOnly
          />
        </div>
        <div className={getInputBoxClass(!!errors.address, true)}>
          <input
            className="address-input-form__input"
            type="text"
            placeholder="상세주소를 입력해주세요"
            value={addressDetail}
            onChange={(e) => onAddressDetailChange(e.target.value)}
            onBlur={onAddressDetailBlur}
          />
        </div>
        {errors.address && (
          <span className="address-input-form__error">{errors.address}</span>
        )}
      </div>

      {showAddressLayer && (
        <div className="address-layer-overlay">
          <div className="address-layer-container">
            <div className="address-layer-header">
              <span>주소 검색</span>
              <button
                type="button"
                className="address-layer-close"
                onClick={handleCloseLayer}
              >
                닫기
              </button>
            </div>
            <div className="address-layer-content" ref={layerRef} />
          </div>
        </div>
      )}
    </div>
  );
}
