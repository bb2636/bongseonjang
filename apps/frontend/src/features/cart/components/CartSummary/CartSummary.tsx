import './CartSummary.css';

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  onOrder: () => void;
}

export function CartSummary({
  subtotal,
  itemCount,
  onOrder,
}: CartSummaryProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <div className="cart-summary">
      <button
        className="cart-summary__order-button"
        onClick={onOrder}
        disabled={itemCount === 0}
      >
        {itemCount > 0 ? `${formatPrice(subtotal)} 구매하기 (${itemCount}개)` : '상품을 담아주세요'}
      </button>
    </div>
  );
}
