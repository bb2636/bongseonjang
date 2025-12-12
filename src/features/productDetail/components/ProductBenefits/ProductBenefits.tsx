import './ProductBenefits.css';

interface ProductBenefitsProps {
  points?: number;
  notice?: string;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export default function ProductBenefits({
  points = 0,
  notice,
}: ProductBenefitsProps) {
  return (
    <div className="product-benefits">
      <div className="product-benefits__info">
        <div className="product-benefits__row">
          <span className="product-benefits__label">혜택</span>
          <span className="product-benefits__value">{formatPrice(points)}p 적립</span>
        </div>

        <div className="product-benefits__row product-benefits__row--align-top">
          <span className="product-benefits__label">배송</span>
          <div className="product-benefits__shipping">
            <span className="product-benefits__value">배송비 선불</span>
            <span className="product-benefits__shipping-note">
              제주도/도서산간 3,500원 추가
            </span>
          </div>
        </div>
      </div>

      <div className="product-benefits__notice">
        <span className="product-benefits__notice-title">주문 전 꼭 확인해주세요</span>
        <span className="product-benefits__notice-content">
          {notice || '주말 및 공휴일이 포함되어있거나 주문량이 많은 경우, 출고일까지 1-3일 소요될 수 있습니다'}
        </span>
      </div>

      <div className="product-benefits__divider" />
    </div>
  );
}
