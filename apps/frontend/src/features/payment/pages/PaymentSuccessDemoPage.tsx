import { useNavigate } from 'react-router-dom';
import './PaymentResultPage.css';

export function PaymentSuccessDemoPage() {
  const navigate = useNavigate();
  const orderNumber = 'ORD260106ABC123';

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
        <p className="payment-result-order-number">
          주문번호: {orderNumber}
        </p>
        <p className="payment-result-guest-notice">
          주문 조회를 위해 주문번호와 비밀번호를 기억해주세요.
        </p>
        <div className="payment-result-buttons">
          <button
            className="payment-result-button payment-result-button--primary"
            onClick={() => navigate('/orders/guest')}
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
