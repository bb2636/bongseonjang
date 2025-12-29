import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { fetchCart } from '../../cart/api/cartApi';
import './PaymentResultPage.css';

export function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const message = searchParams.get('message') || '결제 처리 중 오류가 발생했습니다';
  const orderNumber = searchParams.get('orderNumber');

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['cart'],
      queryFn: fetchCart,
      staleTime: 1000 * 60,
    });
  }, [queryClient]);

  return (
    <div className="payment-result-page">
      <div className="payment-result-content">
        <div className="payment-result-icon payment-result-icon--fail">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="payment-result-title">결제 실패</h1>
        <p className="payment-result-message">{message}</p>
        {orderNumber && (
          <p className="payment-result-order-number">
            주문번호: {orderNumber}
          </p>
        )}
        <div className="payment-result-buttons">
          <button
            className="payment-result-button payment-result-button--primary"
            onClick={() => navigate('/cart')}
          >
            장바구니로 돌아가기
          </button>
          <button
            className="payment-result-button payment-result-button--secondary"
            onClick={() => navigate('/')}
          >
            홈으로 가기
          </button>
        </div>
      </div>
    </div>
  );
}
