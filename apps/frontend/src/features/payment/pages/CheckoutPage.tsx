import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCart } from '../../cart/api/cartApi';
import { fetchDefaultAddress, fetchAddresses, AddressResponse } from '../../address/api/addressApi';
import { fetchUserProfile } from '../../profile/api/profileApi';
import { preparePayment, prepareDirectPayment, DirectPurchaseItem } from '../api/paymentApi';
import { fetchProductDetail } from '../../productDetail/api/productDetailApi';
import type { ProductDetail } from '../../productDetail/types/productDetail';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { PaymentLoadingOverlay, PaymentStep } from '../../../components';
import { DeliveryRequestBottomSheet } from '../components/DeliveryRequestBottomSheet';
import { AddressSelectBottomSheet } from '../components/AddressSelectBottomSheet';
import './CheckoutPage.css';

interface DirectPurchaseData {
  productId: string;
  items: DirectPurchaseItem[];
}

interface DisplayItem {
  id: string;
  productName: string;
  productImageUrl: string;
  optionName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

declare global {
  interface Window {
    AUTHNICE: {
      requestPay: (options: {
        clientId: string;
        method: string;
        orderId: string;
        amount: number;
        goodsName: string;
        returnUrl: string;
        vbankHolder?: string;
        fnError: (result: { errorMsg: string }) => void;
      }) => void;
    };
  }
}

const DELIVERY_REQUEST_OPTIONS = [
  '조심히 안전하게 와주세요 :)',
  '문 앞에 두고 가세요',
  '도착 전에 전화주세요',
  '경비실에 맡겨주세요',
  '부재 시 연락 주세요',
  '직접 입력',
];

export function CheckoutPage() {
  const navigate = useNavigate();
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

  const [deliveryRequest, setDeliveryRequest] = useState('');
  const [customDeliveryRequest, setCustomDeliveryRequest] = useState('');
  const [isDeliverySheetOpen, setIsDeliverySheetOpen] = useState(false);
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const hasUserSelectedAddress = useRef(false);
  const [isProductsExpanded, setIsProductsExpanded] = useState(true);
  const [pointInput, setPointInput] = useState('');
  const [usedPoints, setUsedPoints] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('preparing');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'vbank'>('card');
  const [termsAgreed, setTermsAgreed] = useState(false);

  const { data: cart, isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    staleTime: 1000 * 60 * 5,
    enabled: !isDirectMode,
  });

  const { data: directProduct, isLoading: isDirectProductLoading } = useQuery({
    queryKey: ['directProduct', directPurchaseData?.productId],
    queryFn: () => fetchProductDetail(directPurchaseData!.productId),
    staleTime: 1000 * 60 * 5,
    enabled: isDirectMode && !!directPurchaseData?.productId,
  });

  const { data: defaultAddress, isLoading: isAddressLoading } = useQuery({
    queryKey: ['defaultAddress'],
    queryFn: fetchDefaultAddress,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: addresses = [], isLoading: isAddressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = isDirectMode 
    ? (isDirectProductLoading || isAddressLoading || isAddressesLoading || isProfileLoading)
    : (isCartLoading || isAddressLoading || isAddressesLoading || isProfileLoading);

  useEffect(() => {
    if (defaultAddress && !hasUserSelectedAddress.current) {
      setSelectedAddress(defaultAddress);
    }
  }, [defaultAddress]);

  const currentAddress = selectedAddress || defaultAddress;

  const displayItems: DisplayItem[] = useMemo(() => {
    if (isDirectMode && directProduct && directPurchaseData) {
      return directPurchaseData.items.map((item, index) => {
        const productOption = item.productOptionId 
          ? directProduct.options.find(opt => opt.id === item.productOptionId) ||
            directProduct.mainOptions.find(opt => opt.id === item.productOptionId)
          : null;
        
        const unitPrice = productOption ? productOption.price : directProduct.discountedPrice;
        
        return {
          id: `direct-${index}`,
          productName: directProduct.name,
          productImageUrl: directProduct.thumbnailUrl || '',
          optionName: productOption?.name || null,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
        };
      });
    }
    
    const cartSelectedItems = cart?.items.filter(item => selectedItemIds.includes(item.id)) || [];
    return cartSelectedItems.map(item => ({
      id: item.id,
      productName: item.productName,
      productImageUrl: item.productImageUrl,
      optionName: item.productOptionName || null,
      quantity: item.quantity,
      unitPrice: item.totalPrice / item.quantity,
      totalPrice: item.totalPrice,
    }));
  }, [isDirectMode, directProduct, directPurchaseData, cart, selectedItemIds]);

  const productAmount = displayItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const availablePoints = userProfile?.points ?? 0;
  const couponCount = userProfile?.couponCount ?? 0;
  const finalAmount = productAmount - usedPoints;

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

  const handlePointInputChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setPointInput(numericValue);
  };

  const handleUseAllPoints = () => {
    const maxUsable = Math.min(availablePoints, productAmount);
    setPointInput(maxUsable.toString());
    setUsedPoints(maxUsable);
  };

  const handleApplyPoints = () => {
    const points = parseInt(pointInput) || 0;
    const maxUsable = Math.min(points, availablePoints, productAmount);
    setUsedPoints(maxUsable);
    setPointInput(maxUsable.toString());
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentAddress) {
      showToast('배송지를 등록해주세요', 'error');
      return;
    }

    if (displayItems.length === 0) {
      showToast('결제할 상품이 없습니다', 'error');
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
      let paymentData;
      
      if (isDirectMode && directPurchaseData) {
        paymentData = await prepareDirectPayment({
          productId: directPurchaseData.productId,
          items: directPurchaseData.items,
          recipientName: currentAddress.recipientName,
          recipientPhone: currentAddress.recipientPhone,
          postalCode: currentAddress.postalCode,
          address: currentAddress.address,
          addressDetail: currentAddress.addressDetail,
          deliveryRequest: finalDeliveryRequest,
          paymentMethod,
        });
      } else {
        paymentData = await preparePayment({
          selectedItemIds,
          recipientName: currentAddress.recipientName,
          recipientPhone: currentAddress.recipientPhone,
          postalCode: currentAddress.postalCode,
          address: currentAddress.address,
          addressDetail: currentAddress.addressDetail,
          deliveryRequest: finalDeliveryRequest,
          paymentMethod,
        });
      }

      setPaymentStep('connecting');

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
        ...(paymentMethod === 'vbank' && { vbankHolder: currentAddress.recipientName }),
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
        <button className="checkout-back-button" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="checkout-title">주문/결제</h1>
        <div style={{ width: 24 }} />
      </header>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <section className="checkout-address-card">
          {currentAddress ? (
            <>
              <div className="checkout-address-header">
                <div className="checkout-address-name-row">
                  <span className="checkout-address-name">{currentAddress.addressName}</span>
                  {currentAddress.isDefault && (
                    <span className="checkout-address-default-label">기본배송지</span>
                  )}
                </div>
                <button 
                  type="button" 
                  className="checkout-address-change-button"
                  onClick={() => setIsAddressSheetOpen(true)}
                >
                  변경
                </button>
              </div>
              <div className="checkout-address-details">
                <p className="checkout-address-detail-text">{currentAddress.recipientName}</p>
                <p className="checkout-address-detail-text">
                  ({currentAddress.postalCode}) {currentAddress.address} {currentAddress.addressDetail}
                </p>
                <p className="checkout-address-detail-text">
                  {formatPhoneNumber(currentAddress.recipientPhone)}
                </p>
              </div>
            </>
          ) : (
            <div className="checkout-no-address">
              <p>등록된 배송지가 없습니다</p>
              <button 
                type="button" 
                className="checkout-add-address-button"
                onClick={() => navigate('/address/add')}
              >
                배송지 등록
              </button>
            </div>
          )}
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

        <section className="checkout-section">
          <div 
            className="checkout-section-header checkout-section-header--clickable"
          >
            <h2 className="checkout-section-title">포인트 할인</h2>
            <svg 
              className="checkout-expand-icon checkout-expand-icon--expanded"
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="checkout-point-section">
            <div className="checkout-point-input-row">
              <div className="checkout-point-input-wrapper">
                <input
                  type="text"
                  className="checkout-point-input"
                  value={pointInput}
                  onChange={(e) => handlePointInputChange(e.target.value)}
                  onBlur={handleApplyPoints}
                  placeholder="0"
                />
                {pointInput && (
                  <button 
                    type="button" 
                    className="checkout-point-clear"
                    onClick={() => { setPointInput(''); setUsedPoints(0); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.3)"/>
                      <path d="M8 8L16 16M16 8L8 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
              <button 
                type="button" 
                className="checkout-point-all-button"
                onClick={handleUseAllPoints}
              >
                전액 사용
              </button>
            </div>
            <p className="checkout-point-available">
              사용 가능 포인트 <span className="checkout-point-value">{availablePoints.toLocaleString()}p</span>
            </p>
          </div>
        </section>

        <section className="checkout-section">
          <div 
            className="checkout-section-header checkout-section-header--clickable"
          >
            <h2 className="checkout-section-title">쿠폰 할인</h2>
            <svg 
              className="checkout-expand-icon checkout-expand-icon--expanded"
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="checkout-coupon-section">
            <select className="checkout-select">
              <option>적용할 수 있는 쿠폰이 없습니다</option>
            </select>
            <p className="checkout-coupon-available">
              보유쿠폰 <span className="checkout-coupon-value">{couponCount}장</span>
            </p>
          </div>
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
            {usedPoints > 0 && (
              <div className="checkout-summary-row">
                <span className="checkout-summary-label">포인트 할인</span>
                <span className="checkout-summary-value checkout-summary-value--discount">-{usedPoints.toLocaleString()}원</span>
              </div>
            )}
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
          disabled={isProcessing || !currentAddress || !termsAgreed}
        >
          {isProcessing ? '처리 중...' : `${finalAmount.toLocaleString()}원 결제하기`}
        </button>
      </form>

      <DeliveryRequestBottomSheet
        isOpen={isDeliverySheetOpen}
        onClose={() => setIsDeliverySheetOpen(false)}
        options={DELIVERY_REQUEST_OPTIONS}
        selectedOption={deliveryRequest}
        onSelect={handleDeliveryRequestChange}
      />

      <AddressSelectBottomSheet
        isOpen={isAddressSheetOpen}
        onClose={() => setIsAddressSheetOpen(false)}
        addresses={addresses}
        selectedAddressId={currentAddress?.id || null}
        onSelect={(address) => {
          hasUserSelectedAddress.current = true;
          setSelectedAddress(address);
        }}
        onEdit={(address) => navigate(`/address/edit/${address.id}`)}
        onAddNew={() => navigate('/address/add')}
      />
    </div>
  );
}
