import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { guestCartStorage, guestShippingStorage, guestOrdererStorage } from '../../../utils/guestStorage';
import './PaymentResultPage.css';

function formatExpiresAt(raw: string | null): string | null {
  if (!raw) {
    return null;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  const hour = String(parsed.getHours()).padStart(2, '0');
  const minute = String(parsed.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orderNumber = searchParams.get('orderNumber');
  const isGuest = searchParams.get('guest') === 'true';

  const isVirtualAccount = searchParams.get('vbank') === 'true';
  const vbankName = searchParams.get('vbankName');
  const vbankNumber = searchParams.get('vbankNumber');
  const vbankHolder = searchParams.get('vbankHolder');
  const vbankExpiresAt = formatExpiresAt(searchParams.get('vbankExpiresAt'));

  const [isCopied, setIsCopied] = useState(false);

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

  const handleCopyAccount = async () => {
    if (!vbankNumber) {
      return;
    }
    try {
      await navigator.clipboard.writeText(vbankNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setIsCopied(false);
    }
  };

  const title = isVirtualAccount ? '입금 대기 중' : '결제 완료';
  const message = isVirtualAccount
    ? '아래 계좌로 입금하시면 주문이 완료됩니다.'
    : '주문이 성공적으로 완료되었습니다.';

  return (
    <div className="payment-result-page">
      <div className="payment-result-content">
        <div className={`payment-result-icon ${isVirtualAccount ? 'payment-result-icon--pending' : 'payment-result-icon--success'}`}>
          {isVirtualAccount ? (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <h1 className="payment-result-title">{title}</h1>
        <p className="payment-result-message">{message}</p>
        {orderNumber && (
          <p className="payment-result-order-number">
            주문번호: {orderNumber}
          </p>
        )}

        {isVirtualAccount && (
          <div className="payment-result-vbank">
            <div className="payment-result-vbank-row">
              <span className="payment-result-vbank-label">은행</span>
              <span className="payment-result-vbank-value">{vbankName || '-'}</span>
            </div>
            <div className="payment-result-vbank-row">
              <span className="payment-result-vbank-label">계좌번호</span>
              <span className="payment-result-vbank-value payment-result-vbank-value--account">
                {vbankNumber || '-'}
                {vbankNumber && (
                  <button
                    type="button"
                    className="payment-result-vbank-copy"
                    onClick={handleCopyAccount}
                  >
                    {isCopied ? '복사됨' : '복사'}
                  </button>
                )}
              </span>
            </div>
            <div className="payment-result-vbank-row">
              <span className="payment-result-vbank-label">예금주</span>
              <span className="payment-result-vbank-value">{vbankHolder || '-'}</span>
            </div>
            {vbankExpiresAt && (
              <div className="payment-result-vbank-row">
                <span className="payment-result-vbank-label">입금기한</span>
                <span className="payment-result-vbank-value">{vbankExpiresAt}</span>
              </div>
            )}
          </div>
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
