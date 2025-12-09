import { ProductCarousel } from '@/components/ProductCarousel';
import type { FreshFood } from '../../types/freshFood';
import './FreshFoodSection.css';

interface FreshFoodSectionProps {
  products: FreshFood[];
  isLoading: boolean;
  onAddToCart?: (productId: string) => void;
  onHeartClick?: (productId: string) => void;
  onViewAll?: () => void;
}

const CARD_WIDTH = 167.5;
const CARD_HEIGHT = 175;

export default function FreshFoodSection({
  products,
  isLoading,
  onAddToCart,
  onHeartClick,
  onViewAll,
}: FreshFoodSectionProps) {
  if (isLoading) {
    return (
      <section className="fresh-food-section">
        <div className="fresh-food-section__header">
          <h2 className="fresh-food-section__title">신선식품</h2>
        </div>
        <div className="fresh-food-section__loading">로딩 중...</div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="fresh-food-section">
      <div className="fresh-food-section__header">
        <h2 className="fresh-food-section__title">신선식품</h2>
        <button
          type="button"
          className="fresh-food-section__view-all"
          onClick={onViewAll}
        >
          <span>전체보기</span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 2.5L8.5 6.5L4.5 10.5"
              stroke="#3B9BD5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <ProductCarousel
        products={products}
        isLoading={isLoading}
        cardWidth={CARD_WIDTH}
        cardHeight={CARD_HEIGHT}
        showHeartButton
        onAddToCart={onAddToCart}
        onHeartClick={onHeartClick}
      />
    </section>
  );
}
