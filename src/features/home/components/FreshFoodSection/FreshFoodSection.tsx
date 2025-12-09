import { ProductCarousel } from '@/components/ProductCarousel';
import { SectionHeader } from '@/components/SectionHeader';
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
        <SectionHeader title="신선식품" />
        <div className="fresh-food-section__loading">로딩 중...</div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="fresh-food-section">
      <SectionHeader title="신선식품" onViewAll={onViewAll} />
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
