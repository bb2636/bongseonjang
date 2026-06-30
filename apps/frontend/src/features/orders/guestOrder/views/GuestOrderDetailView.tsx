import { GuestOrderDetail } from '../../../payment/api/paymentApi';
import './GuestOrderDetailView.css';

interface GuestOrderDetailViewProps {
  order: GuestOrderDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  onBack: () => void;
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

export default function GuestOrderDetailView({
  order,
  isLoading,
  isError,
  onBack,
}: GuestOrderDetailViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  if (isLoading) {
    return (
      <div className="guest-order-detail">
        <header className="guest-order-detail__header">
          <button className="guest-order-detail__back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="guest-order-detail__title">주문 상세</h1>
          <div className="guest-order-detail__header-placeholder" />
        </header>
        <div className="guest-order-detail__header-spacer" />
        <div className="guest-order-detail__loading">
          <div className="guest-order-detail__skeleton-block" />
          <div className="guest-order-detail__skeleton-block" />
          <div className="guest-order-detail__skeleton-block" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="guest-order-detail">
        <header className="guest-order-detail__header">
          <button className="guest-order-detail__back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="guest-order-detail__title">주문 상세</h1>
          <div className="guest-order-detail__header-placeholder" />
        </header>
        <div className="guest-order-detail__header-spacer" />
        <div className="guest-order-detail__error">
          <p>주문 정보를 불러올 수 없습니다.</p>
          <button className="guest-order-detail__error-button" onClick={onBack}>
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="guest-order-detail">
      <header className="guest-order-detail__header">
        <button className="guest-order-detail__back-button" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="guest-order-detail__title">주문 상세</h1>
        <div className="guest-order-detail__header-placeholder" />
      </header>
      <div className="guest-order-detail__header-spacer" />

      <div className="guest-order-detail__content">
        <section className="guest-order-detail__section">
          <div className="guest-order-detail__order-info">
            <div className="guest-order-detail__order-header">
              <span className="guest-order-detail__order-date">{formatDate(order.createdAt)}</span>
              <span className={`guest-order-detail__order-status guest-order-detail__order-status--${order.status}`}>
                {ORDER_STATUS_MAP[order.status] || order.status}
              </span>
            </div>
            <p className="guest-order-detail__order-number">주문번호: {order.orderNumber}</p>
          </div>
        </section>

        <section className="guest-order-detail__section">
          <h2 className="guest-order-detail__section-title">배송지 정보</h2>
          <div className="guest-order-detail__info-row">
            <span className="guest-order-detail__info-label">받는 분</span>
            <span className="guest-order-detail__info-value">{order.recipientName}</span>
          </div>
          <div className="guest-order-detail__info-row">
            <span className="guest-order-detail__info-label">연락처</span>
            <span className="guest-order-detail__info-value">{order.recipientPhone}</span>
          </div>
          <div className="guest-order-detail__info-row">
            <span className="guest-order-detail__info-label">주소</span>
            <span className="guest-order-detail__info-value">
              [{order.postalCode}] {order.address}
              {order.addressDetail && ` ${order.addressDetail}`}
            </span>
          </div>
          {order.deliveryRequest && (
            <div className="guest-order-detail__info-row">
              <span className="guest-order-detail__info-label">배송 요청</span>
              <span className="guest-order-detail__info-value">{order.deliveryRequest}</span>
            </div>
          )}
        </section>

        <section className="guest-order-detail__section">
          <h2 className="guest-order-detail__section-title">주문 상품</h2>
          <div className="guest-order-detail__items">
            {order.items.map((item, index) => (
              <div key={index} className="guest-order-detail__item">
                <div className="guest-order-detail__item-info">
                  <span className="guest-order-detail__item-name">{item.productName}</span>
                  {item.optionName && (
                    <span className="guest-order-detail__item-option">{item.optionName}</span>
                  )}
                  <span className="guest-order-detail__item-qty">수량: {item.quantity}개</span>
                </div>
                <span className="guest-order-detail__item-price">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="guest-order-detail__section">
          <h2 className="guest-order-detail__section-title">결제 정보</h2>
          <div className="guest-order-detail__info-row">
            <span className="guest-order-detail__info-label">상품 금액</span>
            <span className="guest-order-detail__info-value">{formatPrice(order.totalProductPrice)}</span>
          </div>
          <div className="guest-order-detail__info-row guest-order-detail__info-row--total">
            <span className="guest-order-detail__info-label">총 결제 금액</span>
            <span className="guest-order-detail__info-value guest-order-detail__info-value--total">
              {formatPrice(order.finalAmount)}
            </span>
          </div>
          {order.paidAt && (
            <div className="guest-order-detail__info-row">
              <span className="guest-order-detail__info-label">결제일시</span>
              <span className="guest-order-detail__info-value">{formatDate(order.paidAt)}</span>
            </div>
          )}
        </section>

        {order.paymentMethod === 'virtual_account' && order.vbankNumber && (
          <section className="guest-order-detail__section">
            <h2 className="guest-order-detail__section-title">가상계좌 정보</h2>
            {order.paymentStatus !== 'completed' && (
              <p className="guest-order-detail__vbank-notice">
                입금 대기 중입니다. 아래 계좌로 입금해주세요.
              </p>
            )}
            <div className="guest-order-detail__info-row">
              <span className="guest-order-detail__info-label">입금은행</span>
              <span className="guest-order-detail__info-value">{order.vbankName || '-'}</span>
            </div>
            <div className="guest-order-detail__info-row">
              <span className="guest-order-detail__info-label">계좌번호</span>
              <span className="guest-order-detail__info-value">{order.vbankNumber}</span>
            </div>
            <div className="guest-order-detail__info-row">
              <span className="guest-order-detail__info-label">예금주</span>
              <span className="guest-order-detail__info-value">{order.vbankHolder || '-'}</span>
            </div>
            {order.vbankExpiresAt && (
              <div className="guest-order-detail__info-row">
                <span className="guest-order-detail__info-label">입금기한</span>
                <span className="guest-order-detail__info-value">{formatDate(order.vbankExpiresAt)}</span>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
