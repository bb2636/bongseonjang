import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCart } from '../../cart/api/cartApi';
import { fetchDefaultAddress } from '../../address/api/addressApi';
import { preparePayment } from '../api/paymentApi';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import './CheckoutPage.css';

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
  '배송 메세지를 선택해주세요',
  '문 앞에 놓아주세요',
  '경비실에 맡겨주세요',
  '배송 전 연락 부탁드립니다',
  '부재 시 연락 주세요',
  '직접 입력',
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedItemIds = searchParams.get('items')?.split(',') || [];

  const [deliveryRequest, setDeliveryRequest] = useState('');
  const [customDeliveryRequest, setCustomDeliveryRequest] = useState('');
  const [isProductsExpanded, setIsProductsExpanded] = useState(true);
  const [pointInput, setPointInput] = useState('');
  const [usedPoints, setUsedPoints] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'vbank'>('card');
  const [termsAgreed, setTermsAgreed] = useState(false);

  const { data: cart, isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });

  const { data: defaultAddress, isLoading: isAddressLoading } = useQuery({
    queryKey: ['defaultAddress', user?.id],
    queryFn: fetchDefaultAddress,
    enabled: !!user,
  });

  const isLoading = isCartLoading || isAddressLoading;

  const selectedItems = cart?.items.filter(item => selectedItemIds.includes(item.id)) || [];
  const productAmount = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const availablePoints = 3000;
  const finalAmount = productAmount - usedPoints;

  useEffect(() => {
    if (!isLoading && selectedItemIds.length === 0) {
      showToast('결제할 상품을 선택해주세요', 'error');
      navigate('/cart');
    }
  }, [isLoading, selectedItemIds, navigate, showToast]);

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

    if (!defaultAddress) {
      showToast('배송지를 등록해주세요', 'error');
      return;
    }

    if (selectedItemIds.length === 0) {
      showToast('결제할 상품이 없습니다', 'error');
      return;
    }

    setIsProcessing(true);

    const finalDeliveryRequest = deliveryRequest === '직접 입력' 
      ? customDeliveryRequest 
      : deliveryRequest === '배송 메세지를 선택해주세요' 
        ? '' 
        : deliveryRequest;

    try {
      const paymentData = await preparePayment({
        selectedItemIds,
        recipientName: defaultAddress.recipientName,
        recipientPhone: defaultAddress.recipientPhone,
        postalCode: defaultAddress.postalCode,
        address: defaultAddress.address,
        addressDetail: defaultAddress.addressDetail,
        deliveryRequest: finalDeliveryRequest,
        paymentMethod,
      });

      if (!window.AUTHNICE) {
        showToast('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.', 'error');
        setIsProcessing(false);
        return;
      }

      window.AUTHNICE.requestPay({
        clientId: paymentData.clientKey,
        method: paymentMethod,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        goodsName: paymentData.goodsName,
        returnUrl: paymentData.returnUrl,
        ...(paymentMethod === 'vbank' && { vbankHolder: defaultAddress.recipientName }),
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
          {defaultAddress ? (
            <>
              <div className="checkout-address-header">
                <div className="checkout-address-name-row">
                  <span className="checkout-address-name">{defaultAddress.addressName}</span>
                  {defaultAddress.isDefault && (
                    <span className="checkout-address-default-label">기본배송지</span>
                  )}
                </div>
                <button type="button" className="checkout-address-change-button">
                  변경
                </button>
              </div>
              <div className="checkout-address-details">
                <p className="checkout-address-detail-text">{defaultAddress.recipientName}</p>
                <p className="checkout-address-detail-text">
                  ({defaultAddress.postalCode}) {defaultAddress.address} {defaultAddress.addressDetail}
                </p>
                <p className="checkout-address-detail-text">
                  {formatPhoneNumber(defaultAddress.recipientPhone)}
                </p>
              </div>
            </>
          ) : (
            <div className="checkout-no-address">
              <p>등록된 배송지가 없습니다</p>
              <button type="button" className="checkout-add-address-button">
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
            <select
              className="checkout-select"
              value={deliveryRequest}
              onChange={(e) => handleDeliveryRequestChange(e.target.value)}
            >
              {DELIVERY_REQUEST_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
              주문상품 <span className="checkout-section-count">{selectedItems.length.toString().padStart(2, '0')}</span>
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
              {selectedItems.map(item => (
                <div key={item.id} className="checkout-item">
                  <img src={item.productImageUrl} alt={item.productName} className="checkout-item-image" />
                  <div className="checkout-item-info">
                    <p className="checkout-item-name">{item.productName}</p>
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
              보유쿠폰 <span className="checkout-coupon-value">3장</span>
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
          disabled={isProcessing || !defaultAddress || !termsAgreed}
        >
          {isProcessing ? '처리 중...' : `${finalAmount.toLocaleString()}원 결제하기`}
        </button>
      </form>
    </div>
  );
}
