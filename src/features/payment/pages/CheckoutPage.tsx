import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCart } from '../../cart/api/cartApi';
import { preparePayment } from '../api/paymentApi';
import { useToast } from '../../../contexts/ToastContext';
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
        fnError: (result: { errorMsg: string }) => void;
      }) => void;
    };
  }
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const selectedItemIds = searchParams.get('items')?.split(',') || [];

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [deliveryRequest, setDeliveryRequest] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });

  const selectedItems = cart?.items.filter(item => selectedItemIds.includes(item.id)) || [];
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  useEffect(() => {
    if (!isLoading && selectedItemIds.length === 0) {
      showToast('결제할 상품을 선택해주세요', 'error');
      navigate('/cart');
    }
  }, [isLoading, selectedItemIds, navigate, showToast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!recipientName || !recipientPhone || !postalCode || !address) {
      showToast('배송지 정보를 모두 입력해주세요', 'error');
      return;
    }

    if (selectedItemIds.length === 0) {
      showToast('결제할 상품이 없습니다', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData = await preparePayment({
        selectedItemIds,
        recipientName,
        recipientPhone,
        postalCode,
        address,
        addressDetail,
        deliveryRequest,
      });

      if (!window.AUTHNICE) {
        showToast('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.', 'error');
        setIsProcessing(false);
        return;
      }

      window.AUTHNICE.requestPay({
        clientId: paymentData.clientKey,
        method: 'card',
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        goodsName: paymentData.goodsName,
        returnUrl: paymentData.returnUrl,
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
        <section className="checkout-section">
          <h2 className="checkout-section-title">배송지 정보</h2>
          
          <div className="checkout-field">
            <label className="checkout-label">받는 분 *</label>
            <input
              type="text"
              className="checkout-input"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div className="checkout-field">
            <label className="checkout-label">연락처 *</label>
            <input
              type="tel"
              className="checkout-input"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="연락처를 입력하세요"
              required
            />
          </div>

          <div className="checkout-field">
            <label className="checkout-label">우편번호 *</label>
            <input
              type="text"
              className="checkout-input"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="우편번호를 입력하세요"
              required
            />
          </div>

          <div className="checkout-field">
            <label className="checkout-label">주소 *</label>
            <input
              type="text"
              className="checkout-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="주소를 입력하세요"
              required
            />
          </div>

          <div className="checkout-field">
            <label className="checkout-label">상세주소</label>
            <input
              type="text"
              className="checkout-input"
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              placeholder="상세주소를 입력하세요"
            />
          </div>

          <div className="checkout-field">
            <label className="checkout-label">배송 요청사항</label>
            <input
              type="text"
              className="checkout-input"
              value={deliveryRequest}
              onChange={(e) => setDeliveryRequest(e.target.value)}
              placeholder="예: 문 앞에 놓아주세요"
            />
          </div>
        </section>

        <section className="checkout-section">
          <h2 className="checkout-section-title">주문 상품 ({selectedItems.length}개)</h2>
          <div className="checkout-items">
            {selectedItems.map(item => (
              <div key={item.id} className="checkout-item">
                <img src={item.productImageUrl} alt={item.productName} className="checkout-item-image" />
                <div className="checkout-item-info">
                  <p className="checkout-item-name">{item.productName}</p>
                  {(item.mainOptionName || item.subOptionName) && (
                    <p className="checkout-item-option">
                      {[item.mainOptionName, item.subOptionName].filter(Boolean).join(' / ')}
                    </p>
                  )}
                  <p className="checkout-item-quantity">수량: {item.quantity}개</p>
                  <p className="checkout-item-price">{item.totalPrice.toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="checkout-section">
          <h2 className="checkout-section-title">결제 정보</h2>
          <div className="checkout-summary">
            <div className="checkout-summary-row">
              <span>상품금액</span>
              <span>{totalAmount.toLocaleString()}원</span>
            </div>
            <div className="checkout-summary-row">
              <span>배송비</span>
              <span className="checkout-shipping-note">배송비 선불 (별도 안내)</span>
            </div>
            <div className="checkout-summary-total">
              <span>총 결제금액</span>
              <span className="checkout-total-price">{totalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="checkout-submit-button"
          disabled={isProcessing}
        >
          {isProcessing ? '처리 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
        </button>
      </form>
    </div>
  );
}
