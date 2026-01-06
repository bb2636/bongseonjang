import { useNavigate } from 'react-router-dom';
import './PaymentResultPage.css';

export function PaymentSuccessMemberDemoPage() {
  const navigate = useNavigate();
  const orderNumber = 'ORD260106XYZ789';

  return (
    <div className="payment-result-page">
      <div className="payment-result-content">
        <div className="payment-result-animated-check">
          <svg className="checkmark" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        <h1 className="payment-result-title">결제 완료</h1>
        <p className="payment-result-message">
          주문이 성공적으로 완료되었습니다.
        </p>
        <p className="payment-result-order-number">
          주문번호: {orderNumber}
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
