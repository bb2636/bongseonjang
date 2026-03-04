import { useCallback } from 'react';
import { InAppBrowser, UrlEvent } from '@capgo/inappbrowser';
import { checkIsCapacitor, getAbsoluteApiUrl } from '@/shared/config/apiConfig';
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

function getBackendBaseUrl(): string {
  const apiUrl = getAbsoluteApiUrl();
  return apiUrl.replace(/\/api$/, '');
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

  const openAddressSearchInAppBrowser = useCallback(async () => {
    const backendUrl = getBackendBaseUrl();
    const searchUrl = `${backendUrl}/static/address-search.html`;

    console.log('[AddressSearch] Opening InAppBrowser:', searchUrl);

    return new Promise<{ zonecode: string; address: string } | null>((resolve) => {
      let resolved = false;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const cleanup = async () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        await InAppBrowser.removeAllListeners();
      };

      const handleResult = async (zonecode: string, addressValue: string) => {
        if (resolved) return;
        resolved = true;
        console.log('[AddressSearch] Detected address result:', { zonecode, address: addressValue });
        await cleanup();
        await InAppBrowser.close().catch(() => {});
        resolve({ zonecode, address: addressValue });
      };

      const handleMessage = async (event: { detail?: { type?: string; zonecode?: string; address?: string } }) => {
        console.log('[AddressSearch] Message from webview:', event);
        const detail = event?.detail;
        if (detail?.type === 'address-result' && detail.zonecode && detail.address) {
          await handleResult(detail.zonecode, detail.address);
        }
      };

      const handleUrlChange = async (event: UrlEvent) => {
        const url = event.url;
        console.log('[AddressSearch] URL changed:', url);

        if (url.includes('/address-callback')) {
          try {
            const urlObj = new URL(url);
            const zonecode = urlObj.searchParams.get('zonecode');
            const addressValue = urlObj.searchParams.get('address');

            if (zonecode && addressValue) {
              await handleResult(zonecode, addressValue);
            }
          } catch (e) {
            console.error('[AddressSearch] Error parsing callback URL:', e);
          }
        }
      };

      const handleClose = () => {
        console.log('[AddressSearch] InAppBrowser closed');

        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(null);
        }
      };

      (async () => {
        await InAppBrowser.addListener('messageFromWebview', handleMessage);
        await InAppBrowser.addListener('urlChangeEvent', handleUrlChange);
        await InAppBrowser.addListener('closeEvent', handleClose);

        timeoutId = setTimeout(async () => {
          if (!resolved) {
            console.log('[AddressSearch] Timeout reached');
            resolved = true;
            await InAppBrowser.removeAllListeners();
            await InAppBrowser.close().catch(() => {});
            resolve(null);
          }
        }, 5 * 60 * 1000);

        try {
          await InAppBrowser.openWebView({ 
            url: searchUrl, 
            title: '주소 검색',
            isPresentAfterPageLoad: true,
            showArrow: true,
          });
          console.log('[AddressSearch] InAppBrowser opened');
        } catch (err) {
          console.error('[AddressSearch] Failed to open InAppBrowser:', err);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          await InAppBrowser.removeAllListeners();
          resolved = true;
          resolve(null);
        }
      })();
    });
  }, []);

  const handleAddressSearch = useCallback(async () => {
    if (isCapacitor) {
      const result = await openAddressSearchInAppBrowser();
      if (result) {
        onAddressSearch(result.zonecode, result.address);
      }
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
  }, [isCapacitor, onAddressSearch, onSearchError, openAddressSearchInAppBrowser]);

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
    </div>
  );
}
