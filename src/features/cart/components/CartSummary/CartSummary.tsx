import './CartSummary.css';

interface CartSummaryProps {
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  itemCount: number;
  onOrder: () => void;
}

export function CartSummary({
  subtotal,
  shippingFee,
  totalAmount,
  itemCount,
  onOrder,
}: CartSummaryProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <div className="cart-summary">
      <div className="cart-summary__details">
        <div className="cart-summary__row">
          <span className="cart-summary__label">상품금액</span>
          <span className="cart-summary__value">{formatPrice(subtotal)}</span>
        </div>
        <div className="cart-summary__row">
          <span className="cart-summary__label">배송비</span>
          <span className="cart-summary__value">
            {shippingFee === 0 ? '무료' : formatPrice(shippingFee)}
          </span>
        </div>
        <div className="cart-summary__divider" />
        <div className="cart-summary__row cart-summary__row--total">
          <span className="cart-summary__label cart-summary__label--total">결제예정금액</span>
          <span className="cart-summary__value cart-summary__value--total">{formatPrice(totalAmount)}</span>
        </div>
      </div>
      <button
        className="cart-summary__order-button"
        onClick={onOrder}
        disabled={itemCount === 0}
      >
        {itemCount > 0 ? `${formatPrice(totalAmount)} 구매하기 (${itemCount}개)` : '상품을 담아주세요'}
      </button>
    </div>
  );
}
