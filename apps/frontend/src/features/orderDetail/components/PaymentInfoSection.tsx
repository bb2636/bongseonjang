import { PaymentInfo } from '../api/orderDetailApi';
import './PaymentInfoSection.css';

interface PaymentInfoSectionProps {
  totalProductPrice: number;
  usedPoints: number;
  couponDiscountAmount: number;
  shippingFee: number;
  finalAmount: number;
  payment: PaymentInfo | null;
}

export function PaymentInfoSection({
  totalProductPrice,
  usedPoints,
  couponDiscountAmount,
  shippingFee,
  finalAmount,
  payment,
}: PaymentInfoSectionProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const formatDiscount = (amount: number) => {
    if (amount === 0) return '0원';
    return `-${amount.toLocaleString()}원`;
  };

  return (
    <section className="payment-info-section">
      <h2 className="payment-info-section__title">결제 정보</h2>
      <div className="payment-info-section__content">
        <div className="payment-info-section__row payment-info-section__row--total">
          <span className="payment-info-section__label">결제금액</span>
          <span className="payment-info-section__value payment-info-section__value--total">
            {formatPrice(finalAmount)}
          </span>
        </div>
        <div className="payment-info-section__divider" />
        <div className="payment-info-section__row">
          <span className="payment-info-section__label">상품 금액</span>
          <span className="payment-info-section__value">{formatPrice(totalProductPrice)}</span>
        </div>
        <div className="payment-info-section__row">
          <span className="payment-info-section__label">포인트 할인</span>
          <span className="payment-info-section__value payment-info-section__value--discount">
            {formatDiscount(usedPoints)}
          </span>
        </div>
        <div className="payment-info-section__row">
          <span className="payment-info-section__label">쿠폰 할인</span>
          <span className="payment-info-section__value payment-info-section__value--discount">
            {formatDiscount(couponDiscountAmount)}
          </span>
        </div>
        <div className="payment-info-section__row">
          <span className="payment-info-section__label">배송비</span>
          <span className="payment-info-section__value">
            {shippingFee === 0 ? '무료' : formatPrice(shippingFee)}
          </span>
        </div>
        <div className="payment-info-section__divider" />
        <div className="payment-info-section__row">
          <span className="payment-info-section__label">결제방법</span>
          <span className="payment-info-section__value">
            {payment?.methodLabel || '-'}
          </span>
        </div>
      </div>
    </section>
  );
}
