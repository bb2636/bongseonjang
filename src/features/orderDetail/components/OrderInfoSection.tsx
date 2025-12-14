import './OrderInfoSection.css';

interface OrderInfoSectionProps {
  orderNumber: string;
  recipientName: string;
  paidAt: string | null;
}

export function OrderInfoSection({
  orderNumber,
  recipientName,
  paidAt,
}: OrderInfoSectionProps) {
  return (
    <section className="order-info-section">
      <h2 className="order-info-section__title">주문 정보</h2>
      <div className="order-info-section__content">
        <div className="order-info-section__row">
          <span className="order-info-section__label">주문번호</span>
          <span className="order-info-section__value">{orderNumber}</span>
        </div>
        <div className="order-info-section__row">
          <span className="order-info-section__label">받는 사람</span>
          <span className="order-info-section__value">{recipientName}</span>
        </div>
        <div className="order-info-section__row">
          <span className="order-info-section__label">결제 일시</span>
          <span className="order-info-section__value">{paidAt || '-'}</span>
        </div>
      </div>
    </section>
  );
}
