import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoBack } from '../../../hooks/useGoBack';
import { useQuery } from '@tanstack/react-query';
import { prepareGuestPayment, GuestCartItem } from '../api/paymentApi';
import { fetchProductDetail } from '../../productDetail/api/productDetailApi';
import { guestCartStorage, guestShippingStorage, guestOrdererStorage } from '../../../utils/guestStorage';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { PaymentLoadingOverlay, PaymentStep } from '../../../components';
import { DeliveryRequestBottomSheet } from '../components/DeliveryRequestBottomSheet';
import { API_BASE_URL, IS_CAPACITOR, CAPACITOR_APP_SCHEME, getAbsoluteApiUrl } from '@/shared/config/apiConfig';
import { InAppBrowser, UrlEvent } from '@capgo/inappbrowser';
import './CheckoutPage.css';

interface DirectPurchaseItem {
  productOptionId: string | null;
  quantity: number;
}

interface DirectPurchaseData {
  productId: string;
  items: DirectPurchaseItem[];
}

interface DisplayItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  optionId: string | null;
  optionName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface DaumPostcodeData {
  zonecode: string;
  address: string;
  addressType: 'R' | 'J';
  bname: string;
  buildingName: string;
  jibunAddress: string;
  roadAddress: string;
  userSelectedType: 'R' | 'J';
}

const DELIVERY_REQUEST_OPTIONS = [
  '조심히 안전하게 와주세요 :)',
  '문 앞에 두고 가세요',
  '도착 전에 전화주세요',
  '경비실에 맡겨주세요',
  '부재 시 연락 주세요',
  '직접 입력',
];

export function GuestCheckoutPage() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const isDirectMode = searchParams.get('direct') === 'true';
  const directDataParam = searchParams.get('data');
  const selectedItemIds = searchParams.get('items')?.split(',') || [];

  const directPurchaseData: DirectPurchaseData | null = useMemo(() => {
    if (!isDirectMode || !directDataParam) return null;
    try {
      return JSON.parse(decodeURIComponent(directDataParam));
    } catch {
      return null;
    }
  }, [isDirectMode, directDataParam]);

  useEffect(() => {
    if (user) {
      navigate('/checkout' + window.location.search, { replace: true });
    }
  }, [user, navigate]);

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [orderPassword, setOrderPassword] = useState('');

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [sameAsOrderer, setSameAsOrderer] = useState(true);

  const [deliveryRequest, setDeliveryRequest] = useState('');
  const [customDeliveryRequest, setCustomDeliveryRequest] = useState('');
  const [isDeliverySheetOpen, setIsDeliverySheetOpen] = useState(false);
  const [isProductsExpanded, setIsProductsExpanded] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('preparing');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'vbank'>('card');
  const [termsAgreed, setTermsAgreed] = useState(false);

  useEffect(() => {
    const savedOrderer = guestOrdererStorage.get();
    if (savedOrderer) {
      setGuestName(savedOrderer.guestName);
      setGuestPhone(savedOrderer.guestPhone);
      setGuestEmail(savedOrderer.guestEmail);
    }
    
    const savedShipping = guestShippingStorage.get();
    if (savedShipping) {
      setRecipientName(savedShipping.recipientName);
      setRecipientPhone(savedShipping.recipientPhone);
      setPostalCode(savedShipping.postalCode);
      setAddress(savedShipping.address);
      setAddressDetail(savedShipping.addressDetail);
      setDeliveryRequest(savedShipping.deliveryRequest);
      setSameAsOrderer(false);
    }
  }, []);

  const saveOrdererToStorage = useCallback(() => {
    if (guestName || guestPhone || guestEmail) {
      guestOrdererStorage.save({ guestName, guestPhone, guestEmail });
    }
  }, [guestName, guestPhone, guestEmail]);

  const saveShippingToStorage = useCallback(() => {
    if (recipientName || postalCode || address) {
      guestShippingStorage.save({
        recipientName,
        recipientPhone,
        postalCode,
        address,
        addressDetail,
        deliveryRequest: deliveryRequest === '직접 입력' ? customDeliveryRequest : deliveryRequest,
      });
    }
  }, [recipientName, recipientPhone, postalCode, address, addressDetail, deliveryRequest, customDeliveryRequest]);

  useEffect(() => {
    const timer = setTimeout(saveOrdererToStorage, 500);
    return () => clearTimeout(timer);
  }, [saveOrdererToStorage]);

  useEffect(() => {
    const timer = setTimeout(saveShippingToStorage, 500);
    return () => clearTimeout(timer);
  }, [saveShippingToStorage]);

  const { data: directProduct, isLoading: isDirectProductLoading } = useQuery({
    queryKey: ['directProduct', directPurchaseData?.productId],
    queryFn: () => fetchProductDetail(directPurchaseData!.productId),
    staleTime: 1000 * 60 * 5,
    enabled: isDirectMode && !!directPurchaseData?.productId,
  });

  useEffect(() => {
    if (sameAsOrderer) {
      setRecipientName(guestName);
      setRecipientPhone(guestPhone);
    }
  }, [sameAsOrderer, guestName, guestPhone]);

  const displayItems: DisplayItem[] = useMemo(() => {
    if (isDirectMode && directProduct && directPurchaseData) {
      return directPurchaseData.items.map((item, index) => {
        const isFromMainOptions = directProduct.mainOptions.some(opt => opt.id === item.productOptionId);
        const productOption = item.productOptionId 
          ? directProduct.options.find(opt => opt.id === item.productOptionId) ||
            directProduct.mainOptions.find(opt => opt.id === item.productOptionId)
          : null;
        
        let unitPrice: number;
        if (productOption) {
          const additionalPrice = 'additionalPrice' in productOption ? productOption.additionalPrice : 0;
          unitPrice = isFromMainOptions 
            ? (additionalPrice || directProduct.discountedPrice)
            : (directProduct.basePrice + additionalPrice);
        } else {
          unitPrice = directProduct.discountedPrice;
        }
        
        return {
          id: `direct-${index}`,
          productId: directProduct.id,
          productName: directProduct.name,
          productImageUrl: directProduct.thumbnailUrl || '',
          optionId: item.productOptionId,
          optionName: productOption?.name || null,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
        };
      });
    }
    
    const guestCart = guestCartStorage.getItems();
    const cartSelectedItems = guestCart.filter(item => selectedItemIds.includes(item.id));
    return cartSelectedItems.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.thumbnailUrl,
      optionId: item.optionId,
      optionName: item.optionName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));
  }, [isDirectMode, directProduct, directPurchaseData, selectedItemIds]);

  const productAmount = displayItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const finalAmount = productAmount;

  const isLoading = isDirectMode ? isDirectProductLoading : false;

  useEffect(() => {
    if (isDirectMode) {
      if (!isLoading && !directPurchaseData) {
        showToast('상품 정보가 올바르지 않습니다', 'error');
        navigate('/');
      }
    } else {
      if (!isLoading && selectedItemIds.length === 0) {
        showToast('결제할 상품을 선택해주세요', 'error');
        navigate('/cart');
      }
    }
  }, [isLoading, isDirectMode, directPurchaseData, selectedItemIds, navigate, showToast]);

  const handleDeliveryRequestChange = (value: string) => {
    setDeliveryRequest(value);
    if (value !== '직접 입력') {
      setCustomDeliveryRequest('');
    }
  };

  const handleAddressSearch = () => {
    const daumWindow = window as unknown as { daum?: { Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => { open: () => void } } };
    if (!daumWindow.daum?.Postcode) {
      showToast('주소 검색 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.', 'error');
      return;
    }
    
    new daumWindow.daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        setPostalCode(data.zonecode);
        setAddress(data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress);
      },
    }).open();
  };

  const handlePhoneChange = (setter: (value: string) => void) => (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setter(cleaned);
  };

  const validateForm = (): boolean => {
    if (!guestName.trim()) {
      showToast('주문자명을 입력해주세요', 'error');
      return false;
    }
    if (!guestPhone.trim() || guestPhone.length < 10) {
      showToast('주문자 휴대폰 번호를 정확히 입력해주세요', 'error');
      return false;
    }
    if (!orderPassword || orderPassword.length < 4 || orderPassword.length > 6) {
      showToast('주문 비밀번호는 4~6자리로 입력해주세요', 'error');
      return false;
    }
    if (!/^\d+$/.test(orderPassword)) {
      showToast('주문 비밀번호는 숫자만 입력해주세요', 'error');
      return false;
    }
    if (!recipientName.trim()) {
      showToast('수령인 이름을 입력해주세요', 'error');
      return false;
    }
    if (!recipientPhone.trim() || recipientPhone.length < 10) {
      showToast('수령인 휴대폰 번호를 정확히 입력해주세요', 'error');
      return false;
    }
    if (!postalCode || !address) {
      showToast('배송지를 입력해주세요', 'error');
      return false;
    }
    if (displayItems.length === 0) {
      showToast('결제할 상품이 없습니다', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setPaymentStep('preparing');

    const finalDeliveryRequest = deliveryRequest === '직접 입력' 
      ? customDeliveryRequest 
      : deliveryRequest === '배송 메세지를 선택해주세요' 
        ? '' 
        : deliveryRequest;

    try {
      const cartItems: GuestCartItem[] = displayItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        optionId: item.optionId,
        optionName: item.optionName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        thumbnailUrl: item.productImageUrl,
      }));

      const paymentData = await prepareGuestPayment({
        cartItems,
        guestName,
        guestPhone,
        guestEmail: guestEmail || undefined,
        orderPassword,
        recipientName,
        recipientPhone,
        postalCode,
        address,
        addressDetail: addressDetail || undefined,
        deliveryRequest: finalDeliveryRequest || undefined,
        paymentMethod,
      });

      setPaymentStep('connecting');

      if (IS_CAPACITOR) {
        const absoluteApiUrl = getAbsoluteApiUrl();
        const paymentFormUrl = `${absoluteApiUrl}/payment/form/${paymentData.orderId}?appScheme=${CAPACITOR_APP_SCHEME}`;
        
        let browserClosed = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        
        const handleUrlChange = async (event: UrlEvent) => {
          const url = event.url;
          console.log('[GuestPayment] URL changed:', url);
          
          if (url.includes('/payment/success') || url.includes('/payment/fail') || url.startsWith(`${CAPACITOR_APP_SCHEME}://`)) {
            browserClosed = true;
            
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            
            await InAppBrowser.removeAllListeners();
            await InAppBrowser.close();
            
            try {
              const urlObj = new URL(url.replace(`${CAPACITOR_APP_SCHEME}://`, 'https://app/'));
              const orderId = urlObj.searchParams.get('orderId') || paymentData.orderId;
              
              if (url.includes('/payment/success') || url.includes('payment-success')) {
                navigate(`/payment/success?orderId=${orderId}`);
              } else if (url.includes('/payment/fail') || url.includes('payment-fail')) {
                const message = urlObj.searchParams.get('message') || '결제에 실패했습니다';
                navigate(`/payment/fail?message=${encodeURIComponent(message)}`);
              }
            } catch {
              navigate(`/payment/success?orderId=${paymentData.orderId}`);
            }
          }
        };
        
        const handleClose = () => {
          console.log('[GuestPayment] InAppBrowser closed');
          
          if (!browserClosed) {
            browserClosed = true;
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            InAppBrowser.removeAllListeners();
            setIsProcessing(false);
          }
        };
        
        await InAppBrowser.addListener('urlChangeEvent', handleUrlChange);
        await InAppBrowser.addListener('closeEvent', handleClose);
        
        timeoutId = setTimeout(async () => {
          if (!browserClosed) {
            console.log('[GuestPayment] Timeout reached');
            browserClosed = true;
            await InAppBrowser.removeAllListeners();
            await InAppBrowser.close().catch(() => {});
            setIsProcessing(false);
            showToast('결제 시간이 초과되었습니다', 'error');
          }
        }, 10 * 60 * 1000);
        
        try {
          await InAppBrowser.openWebView({ url: paymentFormUrl });
          console.log('[GuestPayment] InAppBrowser opened');
        } catch (err) {
          console.error('[GuestPayment] Failed to open InAppBrowser:', err);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          await InAppBrowser.removeAllListeners();
          setIsProcessing(false);
          showToast('결제창을 열 수 없습니다', 'error');
        }
        
        return;
      }

      if (!window.AUTHNICE) {
        showToast('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.', 'error');
        setIsProcessing(false);
        return;
      }

      setPaymentStep('waiting');

      window.AUTHNICE.requestPay({
        clientId: paymentData.clientKey,
        method: paymentMethod,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        goodsName: paymentData.goodsName,
        returnUrl: paymentData.returnUrl,
        ...(paymentMethod === 'vbank' && { vbankHolder: recipientName }),
        fnError: (result) => {
          showToast(`결제 오류: ${result.errorMsg}`, 'error');
          setIsProcessing(false);
        },
      });
    } catch (error) {
      console.error('Payment preparation failed:', error);
      showToast('결제 준비 중 오류가 발생했습니다', 'error');
      setIsProcessing(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  if (isLoading) {
    return (
      <div className="checkout-page">
        <div className="checkout-loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {isProcessing && <PaymentLoadingOverlay step={paymentStep} />}
      <header className="checkout-header">
        <button type="button" className="checkout-back-button" onClick={goBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="checkout-title">비회원 주문/결제</h1>
        <div style={{ width: 24 }} />
      </header>
      <div className="checkout-header-spacer" />

      <form className="checkout-form" onSubmit={handleSubmit}>
        <section className="checkout-section">
          <div className="checkout-section-header">
            <h2 className="checkout-section-title">주문자 정보</h2>
          </div>
          <div className="checkout-guest-form">
            <div className="checkout-input-group">
              <label className="checkout-label">주문자명 *</label>
              <input
                type="text"
                className="checkout-input"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="이름을 입력해주세요"
              />
            </div>
            <div className="checkout-input-group">
              <label className="checkout-label">휴대폰 번호 *</label>
              <input
                type="tel"
                className="checkout-input"
                value={guestPhone}
                onChange={(e) => handlePhoneChange(setGuestPhone)(e.target.value)}
                placeholder="'-' 없이 숫자만 입력"
                maxLength={11}
              />
            </div>
            <div className="checkout-input-group">
              <label className="checkout-label">이메일 (선택)</label>
              <input
                type="email"
                className="checkout-input"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="주문 확인 메일을 받으실 이메일"
              />
            </div>
            <div className="checkout-input-group">
              <label className="checkout-label">주문 비밀번호 *</label>
              <input
                type="password"
                inputMode="numeric"
                className="checkout-input"
                value={orderPassword}
                onChange={(e) => setOrderPassword(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="4~6자리 숫자 (주문 조회 시 사용)"
                maxLength={6}
              />
              <p className="checkout-input-hint">비회원 주문 조회 시 주문번호와 함께 사용됩니다</p>
            </div>
          </div>
        </section>

        <div className="checkout-divider" />

        <section className="checkout-section">
          <div className="checkout-section-header">
            <h2 className="checkout-section-title">배송지 정보</h2>
          </div>
          <div className="checkout-guest-form">
            <label className="checkout-checkbox-label">
              <input
                type="checkbox"
                checked={sameAsOrderer}
                onChange={(e) => setSameAsOrderer(e.target.checked)}
              />
              <span>주문자 정보와 동일</span>
            </label>
            
            <div className="checkout-input-group">
              <label className="checkout-label">수령인 *</label>
              <input
                type="text"
                className="checkout-input"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="수령인 이름"
                disabled={sameAsOrderer}
              />
            </div>
            <div className="checkout-input-group">
              <label className="checkout-label">수령인 연락처 *</label>
              <input
                type="tel"
                className="checkout-input"
                value={recipientPhone}
                onChange={(e) => handlePhoneChange(setRecipientPhone)(e.target.value)}
                placeholder="'-' 없이 숫자만 입력"
                maxLength={11}
                disabled={sameAsOrderer}
              />
            </div>
            <div className="checkout-input-group">
              <label className="checkout-label">주소 *</label>
              <div className="checkout-address-input-row">
                <input
                  type="text"
                  className="checkout-input checkout-input--postal"
                  value={postalCode}
                  readOnly
                  placeholder="우편번호"
                />
                <button
                  type="button"
                  className="checkout-address-search-button"
                  onClick={handleAddressSearch}
                >
                  주소 검색
                </button>
              </div>
              <input
                type="text"
                className="checkout-input"
                value={address}
                readOnly
                placeholder="주소를 검색해주세요"
              />
              <input
                type="text"
                className="checkout-input"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="상세주소 입력"
              />
            </div>
          </div>
        </section>

        <div className="checkout-divider" />

        <section className="checkout-section">
          <div className="checkout-section-header">
            <h2 className="checkout-section-title">배송 요청사항</h2>
          </div>
          <div className="checkout-delivery-request">
            <button
              type="button"
              className="checkout-delivery-select-button"
              onClick={() => setIsDeliverySheetOpen(true)}
            >
              <span className={deliveryRequest ? 'checkout-delivery-select-text--selected' : 'checkout-delivery-select-text'}>
                {deliveryRequest || '배송 메세지를 선택해주세요'}
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {deliveryRequest === '직접 입력' && (
              <input
                type="text"
                className="checkout-input"
                value={customDeliveryRequest}
                onChange={(e) => setCustomDeliveryRequest(e.target.value)}
                placeholder="배송 요청사항을 입력해주세요"
              />
            )}
          </div>
        </section>

        <section className="checkout-section">
          <div 
            className="checkout-section-header checkout-section-header--clickable"
            onClick={() => setIsProductsExpanded(!isProductsExpanded)}
          >
            <h2 className="checkout-section-title">
              주문상품 <span className="checkout-section-count">{displayItems.length.toString().padStart(2, '0')}</span>
            </h2>
            <svg 
              className={`checkout-expand-icon ${isProductsExpanded ? 'checkout-expand-icon--expanded' : ''}`}
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {isProductsExpanded && (
            <div className="checkout-items">
              {displayItems.map(item => (
                <div key={item.id} className="checkout-item">
                  <img src={item.productImageUrl} alt={item.productName} className="checkout-item-image" />
                  <div className="checkout-item-info">
                    <p className="checkout-item-name">{item.productName}</p>
                    {item.optionName && (
                      <p className="checkout-item-option">{item.optionName}</p>
                    )}
                    <p className="checkout-item-quantity">수량 : {item.quantity}개</p>
                    <p className="checkout-item-price">{item.totalPrice.toLocaleString()}원</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="checkout-section checkout-section--summary">
          <div className="checkout-section-header">
            <h2 className="checkout-section-title">최종 결제금액</h2>
          </div>
          <div className="checkout-summary">
            <div className="checkout-summary-row">
              <span className="checkout-summary-label">총 상품금액</span>
              <span className="checkout-summary-value">{productAmount.toLocaleString()}원</span>
            </div>
          </div>
          <div className="checkout-final-amount">
            <span className="checkout-final-amount-value">{finalAmount.toLocaleString()}원</span>
          </div>
        </section>

        <section className="checkout-section">
          <div className="checkout-section-header">
            <h2 className="checkout-section-title">결제수단</h2>
          </div>
          <div className="checkout-payment-methods">
            <label className="checkout-payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
              />
              <span className="checkout-payment-method-radio"></span>
              <span className="checkout-payment-method-label">카드</span>
            </label>
            <label className="checkout-payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                checked={paymentMethod === 'bank'}
                onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
              />
              <span className="checkout-payment-method-radio"></span>
              <span className="checkout-payment-method-label">계좌이체</span>
            </label>
            <label className="checkout-payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="vbank"
                checked={paymentMethod === 'vbank'}
                onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
              />
              <span className="checkout-payment-method-radio"></span>
              <span className="checkout-payment-method-label">무통장입금</span>
            </label>
          </div>
        </section>

        <section className="checkout-section checkout-section--terms">
          <label className="checkout-terms-checkbox">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
            />
            <span className="checkout-terms-checkmark"></span>
            <span className="checkout-terms-text">주문 내용을 확인하였으며, 결제에 동의합니다</span>
          </label>
        </section>

        <button
          type="submit"
          className="checkout-submit-button"
          disabled={isProcessing || !termsAgreed}
        >
          {isProcessing ? '처리 중...' : `${finalAmount.toLocaleString()}원 결제하기`}
        </button>
      </form>

      <DeliveryRequestBottomSheet
        isOpen={isDeliverySheetOpen}
        onClose={() => setIsDeliverySheetOpen(false)}
        selectedOption={deliveryRequest}
        options={DELIVERY_REQUEST_OPTIONS}
        onSelect={handleDeliveryRequestChange}
      />
    </div>
  );
}
