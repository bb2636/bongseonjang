import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { guestCartStorage, guestShippingStorage, guestOrdererStorage } from '../../../utils/guestStorage';
import './PaymentResultPage.css';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderNumber = searchParams.get('orderNumber');

  useEffect(() => {
    guestCartStorage.clear();
    guestShippingStorage.clear();
    guestOrdererStorage.clear();
  }, []);

  return (
    <div className="payment-result-page">
      <div className="payment-result-content">
        <div className="payment-result-icon payment-result-icon--success">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="payment-result-title">결제 완료</h1>
        <p className="payment-result-message">
          주문이 성공적으로 완료되었습니다.
        </p>
        {orderNumber && (
          <p className="payment-result-order-number">
            주문번호: {orderNumber}
          </p>
        )}
        <p className="payment-result-shipping-notice">
          배송비는 주문 확인 후 별도 연락드립니다.
        </p>
        <div className="payment-result-buttons">
          <button
            className="payment-result-button payment-result-button--primary"
            onClick={() => navigate('/orders')}
          >
            주문 내역 보기
          </button>
          <button
            className="payment-result-button payment-result-button--secondary"
            onClick={() => navigate('/')}
          >
            쇼핑 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
