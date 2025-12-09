import { ProductCarousel } from '@/components/ProductCarousel';
import { SectionHeader } from '@/components/SectionHeader';
import type { Product } from '@/components/ProductCarousel/ProductCarousel';
import './ProductSection.css';

interface ProductSectionProps {
  title: string;
  products: Product[];
  isLoading: boolean;
  showHeartButton?: boolean;
  onAddToCart?: (productId: string) => void;
  onHeartClick?: (productId: string) => void;
  onViewAll?: () => void;
}

const CARD_WIDTH = 167.5;
const CARD_HEIGHT = 175;

export default function ProductSection({
  title,
  products,
  isLoading,
  showHeartButton = false,
  onAddToCart,
  onHeartClick,
  onViewAll,
}: ProductSectionProps) {
  if (isLoading) {
    return (
      <section className="product-section">
        <SectionHeader title={title} />
        <div className="product-section__loading">로딩 중...</div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="product-section">
      <SectionHeader title={title} onViewAll={onViewAll} />
      <ProductCarousel
        products={products}
        isLoading={isLoading}
        cardWidth={CARD_WIDTH}
        cardHeight={CARD_HEIGHT}
        showHeartButton={showHeartButton}
        onAddToCart={onAddToCart}
        onHeartClick={onHeartClick}
      />
    </section>
  );
}
