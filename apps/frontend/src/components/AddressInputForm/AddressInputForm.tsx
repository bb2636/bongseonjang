import { useState, useCallback, useEffect, useRef } from 'react';
import { checkIsCapacitor } from '@/shared/config/apiConfig';
import './AddressInputForm.css';

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: {
          zonecode: string;
          roadAddress: string;
          jibunAddress: string;
          userSelectedType: 'R' | 'J';
        }) => void;
        onclose?: () => void;
        width?: string | number;
        height?: string | number;
      }) => {
        open: () => void;
        embed: (element: HTMLElement) => void;
      };
    };
  }
}

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

const DAUM_POSTCODE_SCRIPT_URL = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

function loadDaumPostcodeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.daum?.Postcode) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src*="postcode.v2.js"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Daum Postcode script')));
      return;
    }

    const script = document.createElement('script');
    script.src = DAUM_POSTCODE_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Daum Postcode script'));
    document.head.appendChild(script);
  });
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
  const isCapacitor = checkIsCapacitor();
  const [showModal, setShowModal] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);

  const historyPushedRef = useRef(false);

  const closeModal = useCallback(() => {
    if (historyPushedRef.current) {
      historyPushedRef.current = false;
      window.history.back();
    }
    setShowModal(false);
  }, []);

  useEffect(() => {
    if (!showModal || !isCapacitor) return;

    let mounted = true;

    const initPostcode = async () => {
      try {
        await loadDaumPostcodeScript();
      } catch {
        if (mounted) {
          onSearchError?.('주소 검색 서비스를 불러오지 못했습니다.');
          setShowModal(false);
        }
        return;
      }

      if (!mounted || !embedRef.current || !window.daum?.Postcode) return;

      embedRef.current.innerHTML = '';

      new window.daum.Postcode({
        oncomplete: (data) => {
          const selectedAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
          onAddressSearch(data.zonecode, selectedAddress);
          if (historyPushedRef.current) {
            historyPushedRef.current = false;
            window.history.back();
          }
          setShowModal(false);
        },
        width: '100%',
        height: '100%',
      }).embed(embedRef.current);
    };

    initPostcode();

    const handleBackButton = () => {
      historyPushedRef.current = false;
      if (mounted) setShowModal(false);
    };

    historyPushedRef.current = true;
    window.history.pushState({ addressModal: true }, '');
    window.addEventListener('popstate', handleBackButton);

    return () => {
      mounted = false;
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [showModal, isCapacitor, onAddressSearch, onSearchError]);

  const handleAddressSearch = useCallback(async () => {
    if (isCapacitor) {
      setShowModal(true);
    } else {
      if (!window.daum?.Postcode) {
        onSearchError?.('주소 검색 서비스를 불러오지 못했습니다. 페이지를 새로고침 해주세요.');
        return;
      }

      new window.daum.Postcode({
        oncomplete: (data) => {
          const selectedAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
          onAddressSearch(data.zonecode, selectedAddress);
        },
      }).open();
    }
  }, [isCapacitor, onAddressSearch, onSearchError]);

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

      {showModal && isCapacitor && (
        <div className="address-modal-overlay" onClick={closeModal}>
          <div className="address-modal" onClick={(e) => e.stopPropagation()}>
            <div className="address-modal__header">
              <button type="button" className="address-modal__back" onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className="address-modal__title">주소 검색</span>
              <div style={{ width: 24 }} />
            </div>
            <div className="address-modal__content" ref={embedRef} />
          </div>
        </div>
      )}
    </div>
  );
}
