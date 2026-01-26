import { ChangeEvent } from 'react';
import { Input, PasswordInput } from '@components';
import { GuestOrder } from '../../../payment/api/paymentApi';
import './GuestOrderLookupView.css';

interface GuestOrderLookupViewProps {
  guestOrderLookup: {
    ordererName: string;
    orderNumber: string;
    orderPassword: string;
    isLoading: boolean;
    isValid: boolean;
    errors: {
      ordererName: string | null;
      orderNumber: string | null;
      orderPassword: string | null;
    };
    order: GuestOrder | null;
    hasSearched: boolean;
    onOrdererNameChange: (value: string) => void;
    onOrderNumberChange: (value: string) => void;
    onOrderPasswordChange: (value: string) => void;
    onOrdererNameBlur: () => void;
    onOrderNumberBlur: () => void;
    onOrderPasswordBlur: () => void;
    onSubmit: () => void;
    onBack: () => void;
    onOrderClick: (orderId: string) => void;
  };
}

const ORDER_STATUS_MAP: Record<string, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  preparing: '상품 준비중',
  shipping: '배송중',
  delivered: '배송 완료',
  cancelled: '주문 취소',
  refund_requested: '환불 요청',
  refunded: '환불 완료',
};

export default function GuestOrderLookupView({ guestOrderLookup }: GuestOrderLookupViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="guest-order-container">
      <header className="guest-order-header">
        <button className="guest-order-back-button" onClick={guestOrderLookup.onBack} aria-label="뒤로가기">
          <span className="guest-order-back-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>
        <h1 className="guest-order-header-title">비회원 주문 조회하기</h1>
        <div className="guest-order-header-placeholder" />
      </header>
      <div className="guest-order-header-spacer" />

      <main className="guest-order-content">
        <div className="guest-order-form">
          <div className="guest-order-input-group">
            <Input
              label="주문자명"
              type="text"
              placeholder="주문자명"
              value={guestOrderLookup.ordererName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => guestOrderLookup.onOrdererNameChange(e.target.value)}
              onBlur={guestOrderLookup.onOrdererNameBlur}
              error={guestOrderLookup.errors.ordererName}
            />

            <Input
              label="주문번호"
              type="text"
              placeholder="주문번호"
              value={guestOrderLookup.orderNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) => guestOrderLookup.onOrderNumberChange(e.target.value)}
              onBlur={guestOrderLookup.onOrderNumberBlur}
              error={guestOrderLookup.errors.orderNumber}
            />

            <PasswordInput
              label="주문 비밀번호"
              placeholder="주문비밀번호"
              value={guestOrderLookup.orderPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => guestOrderLookup.onOrderPasswordChange(e.target.value)}
              onBlur={guestOrderLookup.onOrderPasswordBlur}
              error={guestOrderLookup.errors.orderPassword}
              maxLength={6}
              inputMode="numeric"
            />
          </div>

          <button 
            className="guest-order-submit"
            onClick={guestOrderLookup.onSubmit}
            disabled={guestOrderLookup.isLoading}
          >
            {guestOrderLookup.isLoading ? '조회 중...' : '주문조회'}
          </button>
        </div>

        {guestOrderLookup.hasSearched && guestOrderLookup.order && (
          <div className="guest-order-results">
            <div className="guest-order-list">
              <div 
                className="guest-order-card"
                onClick={() => guestOrderLookup.onOrderClick(guestOrderLookup.order!.id)}
              >
                <div className="guest-order-card-header">
                  <span className="guest-order-card-date">{formatDate(guestOrderLookup.order.createdAt)}</span>
                  <span className={`guest-order-card-status guest-order-card-status--${guestOrderLookup.order.status}`}>
                    {ORDER_STATUS_MAP[guestOrderLookup.order.status] || guestOrderLookup.order.status}
                  </span>
                </div>
                <div className="guest-order-card-number">주문번호: {guestOrderLookup.order.orderNumber}</div>
                <div className="guest-order-card-items">
                  {guestOrderLookup.order.items.map((item, index) => (
                    <div key={index} className="guest-order-card-item">
                      <span className="guest-order-card-item-name">{item.productName}</span>
                      {item.optionName && (
                        <span className="guest-order-card-item-option">({item.optionName})</span>
                      )}
                      <span className="guest-order-card-item-qty">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="guest-order-card-amount">
                  {guestOrderLookup.order.finalAmount.toLocaleString()}원
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
