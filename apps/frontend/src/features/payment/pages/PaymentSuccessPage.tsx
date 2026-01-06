import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { guestCartStorage, guestShippingStorage, guestOrdererStorage } from '../../../utils/guestStorage';
import './PaymentResultPage.css';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orderNumber = searchParams.get('orderNumber');
  const isGuest = searchParams.get('guest') === 'true';

  useEffect(() => {
    guestCartStorage.clear();
    guestShippingStorage.clear();
    guestOrdererStorage.clear();
  }, []);

  const handleViewOrders = () => {
    if (user) {
      navigate('/orders');
    } else {
      navigate('/orders/guest');
    }
  };

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
        {isGuest && (
          <p className="payment-result-guest-notice">
            주문 조회를 위해 주문번호와 비밀번호를 기억해주세요.
          </p>
        )}
        <p className="payment-result-shipping-notice">
          배송비는 주문 확인 후 별도 연락드립니다.
        </p>
        <div className="payment-result-buttons">
          <button
            className="payment-result-button payment-result-button--primary"
            onClick={handleViewOrders}
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
